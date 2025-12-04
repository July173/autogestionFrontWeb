import { useEffect, useState } from "react";
import { getFichas, deleteFicha, createFicha, updateFicha } from "../Api/Services/Ficha";
import { getPrograms, deleteProgram, createProgram, updateProgram } from "../Api/Services/Program";
import { getKnowledgeAreas, deleteKnowledgeArea, createKnowledgeArea, updateKnowledgeArea } from "../Api/Services/KnowledgeArea";
import type { Ficha, Program, KnowledgeArea } from "../Api/types/Modules/general.types";

/**
 * Custom hook for managing general application data.
 * Handles CRUD operations for fichas (training groups), programs, and knowledge areas.
 * Provides loading states, error handling, and data refresh functions.
 * 
 * This hook centralizes data management for general entities used throughout the application,
 * including parallel data loading and individual entity CRUD operations.
 * 
 * @returns Object containing all data arrays, loading state, error state, and CRUD functions
 */
export function useGeneralData() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [knowledgeAreas, setKnowledgeAreas] = useState<KnowledgeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fichasData, programsData, areasData] = await Promise.all([
          getFichas(),
          getPrograms(),
          getKnowledgeAreas(),
        ]);
        setFichas(fichasData);
        setPrograms(programsData);
        setKnowledgeAreas(areasData);
      } catch (err) {
        setError("Error al cargar los datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // CRUD handlers for each entity
  const refreshFichas = async () => setFichas(await getFichas());
  const refreshPrograms = async () => setPrograms(await getPrograms());
  const refreshAreas = async () => setKnowledgeAreas(await getKnowledgeAreas());

  return {
    fichas,
    setFichas,
    programs,
    setPrograms,
    knowledgeAreas,
    setKnowledgeAreas,
    loading,
    error,
    refreshFichas,
    refreshPrograms,
    refreshAreas,
    // Fichas
    createFicha,
    updateFicha,
    deleteFicha,
    // Programs
    createProgram,
    updateProgram,
    deleteProgram,
    // Areas
    createKnowledgeArea,
    updateKnowledgeArea,
    deleteKnowledgeArea,
  };
}
