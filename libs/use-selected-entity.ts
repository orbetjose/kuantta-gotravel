"use client";

import { useEffect, useState } from "react";

type EntityWithId = {
  id: string | number;
};

export function useSelectedEntity<T extends EntityWithId>(
  id: string | number | null | undefined,
  items: T[],
  endpoint: string,
  entityName: string,
) {
  const [selected, setSelected] = useState<T | null>(null);

  useEffect(() => {
    if (!id) {
      setSelected(null);
      return;
    }

    const entityInList = items.find(
      (item) => String(item.id) === String(id),
    );

    if (entityInList) {
      setSelected(entityInList);
      return;
    }

    let cancelled = false;

    async function fetchEntity() {
      setSelected(null);

      try {
        const response = await fetch(
          `${endpoint}?id=${encodeURIComponent(String(id))}`,
        );

        

        if (!response.ok) {
          if (!cancelled) {
            setSelected(null);
          }
          return;
        }

        const entity: T = await response.json();


        if (!cancelled) {
          setSelected(entity);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            `Error obteniendo ${entityName}:`,
            error,
          );
          setSelected(null);
        }
      }
    }

    fetchEntity();

    return () => {
      cancelled = true;
    };
  }, [id, items, endpoint, entityName]);

  return selected;
}