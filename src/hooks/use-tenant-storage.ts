'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTenant } from '@/context/tenant-context';
import { supabase } from '@/lib/supabase';

function getSafeStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSafeStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/**
 * Hook universal de persistência multi-tenant com Supabase + cache local otimista + real-time.
 *
 * @param toolId Identificador único da ferramenta (ex: 'bacterial-gantt', 'kaizen-manager')
 * @param dataKey Nome do dataset (ex: 'recipes', 'batches', 'projects')
 * @param defaultValue Valor padrão caso ainda não exista no banco ou cache
 */
export function useTenantStorage<T>(
  toolId: string,
  dataKey: string,
  defaultValue: T | (() => T)
): [T, (valOrUpdater: T | ((prev: T) => T)) => void, boolean] {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'dhp-enterprise';
  const rowId = `${tenantId}:${toolId}:${dataKey}`;
  const localCacheKey = `aptis_${tenantId}_${toolId}_${dataKey}`;

  const resolvedDefault = typeof defaultValue === 'function'
    ? (defaultValue as () => T)()
    : defaultValue;
  const isArrayExpected = Array.isArray(resolvedDefault);

  const isValidValue = (val: any): boolean => {
    if (val === null || val === undefined) return false;
    if (isArrayExpected && !Array.isArray(val)) return false;
    return true;
  };

  // 1. Inicializa com o cache local (0ms de latência) ou valor padrão
  const [state, setState] = useState<T>(() => {
    const cached = getSafeStorage(localCacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (isValidValue(parsed)) {
          return parsed;
        }
      } catch {}
    }
    return resolvedDefault;
  });

  const [isSynced, setIsSynced] = useState<boolean>(false);
  const stateRef = useRef<T>(state);
  stateRef.current = state;

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Carrega da nuvem (Supabase) e escuta atualizações em Realtime
  useEffect(() => {
    let isCancelled = false;

    // Se mudou de tenant, recarrega do cache do novo tenant imediatamente
    const cached = getSafeStorage(localCacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (isValidValue(parsed)) {
          setState(parsed);
          stateRef.current = parsed;
        }
      } catch {}
    }

    async function loadCloudData() {
      try {
        const { data, error } = await supabase
          .from('tenant_tool_data')
          .select('data')
          .eq('id', rowId)
          .maybeSingle();

        if (error) {
          console.warn(`[useTenantStorage] Aviso ao carregar ${rowId}:`, error.message);
          return;
        }

        if (!isCancelled && data && isValidValue(data.data)) {
          setState(data.data as T);
          stateRef.current = data.data as T;
          setSafeStorage(localCacheKey, JSON.stringify(data.data));
          setIsSynced(true);
        } else if (!isCancelled && (!data || !isValidValue(data.data))) {
          // Nuvem ainda não possui este registro ou possui dado corrompido: semeia com o estado local inicial
          const currentLocal = stateRef.current;
          if (isValidValue(currentLocal)) {
            supabase
              .from('tenant_tool_data')
              .upsert(
                {
                  id: rowId,
                  tenant_id: tenantId,
                  tool_id: toolId,
                  data_key: dataKey,
                  data: currentLocal,
                  updated_at: new Date().toISOString()
                },
                { onConflict: 'id' }
              )
              .then(({ error: upErr }) => {
                if (!upErr && !isCancelled) setIsSynced(true);
              });
          }
        }
      } catch (err) {
        console.warn(`[useTenantStorage] Falha de conexão ao carregar ${rowId}:`, err);
      }
    }

    loadCloudData();

    // 3. Subscrição em Realtime para multi-usuários
    const channel = supabase
      .channel(`tenant_tool_sync_${rowId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tenant_tool_data',
          filter: `id=eq.${rowId}`
        },
        (payload) => {
          if (!isCancelled && payload.new && isValidValue((payload.new as any).data)) {
            const incoming = (payload.new as any).data as T;
            setState(incoming);
            stateRef.current = incoming;
            setSafeStorage(localCacheKey, JSON.stringify(incoming));
          }
        }
      )
      .subscribe();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [tenantId, toolId, dataKey, rowId, localCacheKey]);

  // 4. Setter que atualiza estado local imediatamente e sincroniza com a nuvem
  const setPersistedState = useCallback(
    (valOrUpdater: T | ((prev: T) => T)) => {
      const nextVal =
        typeof valOrUpdater === 'function'
          ? (valOrUpdater as (prev: T) => T)(stateRef.current)
          : valOrUpdater;

      // Atualização otimista imediata na tela
      setState(nextVal);
      stateRef.current = nextVal;

      // Cache local imediato
      setSafeStorage(localCacheKey, JSON.stringify(nextVal));

      // Gravação assíncrona no Supabase com pequeno debounce para evitar throttling de digitação
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const { error } = await supabase.from('tenant_tool_data').upsert(
            {
              id: rowId,
              tenant_id: tenantId,
              tool_id: toolId,
              data_key: dataKey,
              data: nextVal,
              updated_at: new Date().toISOString()
            },
            { onConflict: 'id' }
          );

          if (error) {
            console.warn(`[useTenantStorage] Erro ao sincronizar nuvem para ${rowId}:`, error.message);
          } else {
            setIsSynced(true);
          }
        } catch (err) {
          console.warn(`[useTenantStorage] Exceção ao salvar na nuvem para ${rowId}:`, err);
        }
      }, 400);
    },
    [rowId, tenantId, toolId, dataKey, localCacheKey]
  );

  return [state, setPersistedState, isSynced];
}
