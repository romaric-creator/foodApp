import { useState } from 'react';

/**
 * Hook personnalisé pour sécuriser les actions asynchrones (soumissions, suppressions, etc.)
 * Garantit que l'état de chargement est toujours géré et log les erreurs.
 * 
 * @param {Function} actionFn - Fonction asynchrone à exécuter
 * @param {Function} [onSuccess] - Callback optionnel en cas de succès
 * @param {Function} [onError] - Callback optionnel en cas d'erreur
 */
export const useSafeAction = (actionFn, onSuccess, onError) => {
  const [loading, setLoading] = useState(false);

  const execute = async (...args) => {
    setLoading(true);
    console.log(`[SafeAction] Exécution démarrée...`);
    try {
      const result = await actionFn(...args);
      console.log(`[SafeAction] Succès :`, result);
      if (onSuccess) onSuccess(result);
      return result;
    } catch (err) {
      console.error(`[SafeAction] Erreur :`, err);
      if (onError) onError(err);
      throw err; // On propage l'erreur pour que le composant puisse aussi la gérer
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading };
};
