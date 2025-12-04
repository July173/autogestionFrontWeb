

/**
 * Centralized API endpoint configuration for the Sena project.
 *
 * This file defines the base API URL and groups endpoints by entity or module.
 * It allows importing and using API routes consistently across all services.
 *
 * Usage:
 *   import { ENDPOINTS } from "../config/ConfigApi";
 *
 * Variables:
 *   - API_BASE_URL: Base URL configurable via the VITE_API_BASE_URL environment variable.
 *   - ENDPOINTS: Object with routes grouped by entity (person, user, rol, form, module, etc).
 *
 * ENDPOINTS structure:
 *   - person: Endpoints for person management (apprentice, etc).
 *   - user: Endpoints for users (login, recovery, CRUD).
 *   - menu: Endpoints for dynamic menu by role.
 *   - rol: Endpoints for roles and permissions.
 *   - form: Endpoints for forms.
 *   - module: Endpoints for modules and associated forms.
 *   - apprentice: Endpoints for apprentices.
 *   - instructor: Endpoints for instructors.
 *   - regional, center, sede, program, KnowledgeArea, ficha, permission: Endpoints for general entities.
 *
 * Example usage:
 *   fetch(ENDPOINTS.rol.getRoles)
 *   fetch(ENDPOINTS.user.deleteUser.replace('{id}', userId))
 */

import { get } from "http";
import { permission } from "process";
import { getFichas } from "../Services/Ficha";
import { create } from "domain";
import { reassignInstructor } from "../Services/AssignationInstructor";


/**
 * Base API URL. Configurable via the VITE_API_BASE_URL environment variable.
 * Defaults to "http://django:8000/api/" for local Docker environments.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://django:8000/api/";

/**
 * ENDPOINTS: Object that groups all API routes by entity or module.
 * Each property corresponds to a group of related endpoints.
 * Routes may contain parameters in curly braces (e.g., {id}) that should be replaced dynamically.
 */
export const ENDPOINTS = {
  /** Endpoints for person management (apprentice, etc) */
  person: {
    registerApprentice: `${API_BASE_URL}security/persons/register-apprentice/`,
    IdPerson: `${API_BASE_URL}security/persons/{id}/`,
  },
  /** Endpoints for users (login, recovery, CRUD) */
  user: {
    validateLogin: `${API_BASE_URL}security/users/validate-institutional-login/`,
    validateSecondFactor: `${API_BASE_URL}security/users/validate-2fa-code/`,
    // Sends the code and compares it  // Updates the password  
    getUser: `${API_BASE_URL}security/users/`,
    requestPasswordReset: `${API_BASE_URL}security/users/request-password-reset/`, // Envia el código y lo compara
    resetPassword: `${API_BASE_URL}security/users/reset-password/`, // Actualiza la contraseña
    getUserId: `${API_BASE_URL}security/users/{id}/`,
    deleteUser: `${API_BASE_URL}security/users/{id}/soft-delete/`,
    filter: `${API_BASE_URL}security/users/filter/`,
  },
  /** Endpoints for dynamic menu by role */
  menu: {
    getMenuItems: `${API_BASE_URL}security/rol-form-permissions/{id}/get-menu/`,
  },
  /** Endpoints for roles and permissions */
  rol: {
    getRoles: `${API_BASE_URL}security/roles/`,
    getRolUser: `${API_BASE_URL}security/roles/roles-with-user-count/`,
    postRolPermissions: `${API_BASE_URL}security/rol-form-permissions/create-role-with-permissions/`,
    getRolPermissions: `${API_BASE_URL}security/rol-form-permissions/{id}/get-role-with-permissions/`,
    putRolFormPerms: `${API_BASE_URL}security/rol-form-permissions/{id}/update-role-with-permissions/`,
    getRolesFormsPerms: `${API_BASE_URL}security/rol-form-permissions/permission-matrix/`,
    deleteRolUsers: `${API_BASE_URL}security/roles/{id}/logical-delete-with-users/`,
    filterRol: `${API_BASE_URL}security/roles/filter/`,

  },
  /** Endpoints for forms */
  form: {
    getForm: `${API_BASE_URL}security/forms/`,
    deleteForm: `${API_BASE_URL}security/forms/{id}/`,
    post :`${API_BASE_URL}security/forms/`,
    putForm :`${API_BASE_URL}security/forms/{id}/`,
    getFormById :`${API_BASE_URL}security/forms/{id}/`,
    filterForm :`${API_BASE_URL}security/forms/filter/`,
  },
  /** Endpoints for modules and associated forms */
  module: {
    getModule: `${API_BASE_URL}security/modules/`,
    deleteModule: `${API_BASE_URL}security/modules/{id}/soft-delete/`,
    post: `${API_BASE_URL}security/form-modules/create-module-with-forms/`,
    getModuleForms: `${API_BASE_URL}security/form-modules/{id}/get-module-with-forms/`,
    putModuleForms: `${API_BASE_URL}security/form-modules/{id}/update-module-with-forms/`,
    filterModules: `${API_BASE_URL}security/modules/filter/`,
  },
  /** Endpoints for apprentices */
  apprentice: {
    allApprentices: `${API_BASE_URL}general/aprendices/Create-Aprendiz/create/`,
    getAllApprentices: `${API_BASE_URL}general/aprendices/`,
    putIdApprentice: `${API_BASE_URL}general/aprendices/{id}/Create-Aprendiz/update/`,
  },
  /** Endpoints for instructors */
  instructor: {
    allInstructores: `${API_BASE_URL}general/instructors/Create-Instructor/create/`,
    getAllInstructores: `${API_BASE_URL}general/instructors/`,
    putIdInstructor: `${API_BASE_URL}general/instructors/{id}/Create-Instructor/update/`,
    getCustomList: `${API_BASE_URL}general/instructors/custom-list/`,
    patchLimit: `${API_BASE_URL}general/instructors/{id}/update-learners/`,
    filterInstructores: `${API_BASE_URL}general/instructors/filter/`,
    getInstructorAssignments: `${API_BASE_URL}general/instructors/{id}/asignations/`,
  },
  /** Endpoints for regionals */
  regional: {
    allRegionals: `${API_BASE_URL}general/regionals/`,
    idRegionals: `${API_BASE_URL}general/regionals/{id}/`,
    softDeleteRegionals: `${API_BASE_URL}general/regionals/{id}/soft-delete/
    `,
    filterRegional: `${API_BASE_URL}general/regionals/filter/`,
  },
  /** Endpoints for centers */
  center: {
    allCenters: `${API_BASE_URL}general/centers/`,
    idCenters: `${API_BASE_URL}general/centers/{id}/`,
    softDeleteCenters: `${API_BASE_URL}general/centers/{id}/soft-delete/`,
    filterCenter: `${API_BASE_URL}general/centers/filter/`,
  },
  /** Endpoints for headquarters */
  sede: {
    allSedes: `${API_BASE_URL}general/sedes/`,
    idSedes: `${API_BASE_URL}general/sedes/{id}/`,
    softDeleteSedes: `${API_BASE_URL}general/sedes/{id}/soft-delete/`,
    filterSede: `${API_BASE_URL}general/sedes/filter/`,
  },
  /** Endpoints for programs */
  program: {
    allPrograms: `${API_BASE_URL}general/programs/`,
    getProgramFicha: `${API_BASE_URL}general/programs/{id}/fichas/`,
    IdProgram: `${API_BASE_URL}general/programs/{id}/`,
    deleteIdProgram: `${API_BASE_URL}general/programs/{id}/disable-with-fichas/`,
    filterProgram: `${API_BASE_URL}general/programs/filter/`,
  },
  /** Endpoints for knowledge areas */
  KnowledgeArea: {
    allKnowledgeAreas: `${API_BASE_URL}general/knowledge-areas/`,
    IdKnowledgeArea: `${API_BASE_URL}general/knowledge-areas/{id}/`,
    deleteIdKnowledgeArea: `${API_BASE_URL}general/knowledge-areas/{id}/soft-delete/`,
    filterKnowledgeArea: `${API_BASE_URL}general/knowledge-areas/filter/`,
  },
  /** Endpoints for fichas */
  ficha: {
    allFichas: `${API_BASE_URL}general/fichas/`,
    IdFicha: `${API_BASE_URL}general/fichas/{id}/`,
    deleteIdFicha: `${API_BASE_URL}general/fichas/{id}/soft-delete/`,
    filterFichas: `${API_BASE_URL}general/fichas/filter/`,
  },
  /** Endpoints for permissions */
  permission: {
    getPermissions: `${API_BASE_URL}security/permissions/`,
  },
  
  // Excel templates endpoints for mass registration
  excelTemplates: {
    instructorTemplate: `${API_BASE_URL}security/excel-templates/instructor-template/`,
    apprenticeTemplate: `${API_BASE_URL}security/excel-templates/aprendiz-template/`,
    templateInfo: `${API_BASE_URL}security/excel-templates/template-info/`,
    uploadInstructorExcel: `${API_BASE_URL}security/excel-templates/upload-instructor-excel/`,
    uploadApprenticeExcel: `${API_BASE_URL}security/excel-templates/upload-aprendiz-excel/`,
  },
  requestAsignation :{
    postRequestAssignation : `${API_BASE_URL}assign/request_asignation/form-request/`,
    getFormRequest: `${API_BASE_URL}assign/request_asignation/form-request-list/`,
    getFormRequestById : `${API_BASE_URL}assign/request_asignation/{id}/form-request-detail/`,
    getRequestAsignationById : `${API_BASE_URL}assign/request_asignation/{id}/`,
    patchDenialRequest : `${API_BASE_URL}assign/request_asignation/{id}/form-request-reject/`,
    postPdfRequest : `${API_BASE_URL}assign/form-requests/upload-pdf/`,
    getPdfRequest : `${API_BASE_URL}assign/request_asignation/{id}/form-request-pdf-url/`,
    postAssignInstructor : `${API_BASE_URL}assign/asignation_instructor/custom-create/`,
    getApprenticeDashboard : `${API_BASE_URL}assign/request_asignation/aprendiz-dashboard/`,
    filterRequest : `${API_BASE_URL}assign/request_asignation/form-request-filtered/`,
    postMessageRequest : `${API_BASE_URL}assign/request_asignation/{id}/form-request-update/`,
    getIdMessageRequest : `${API_BASE_URL}assign/request_asignation/{id}/messages/`,
    getOperatorSofiaDashboard : `${API_BASE_URL}assign/request_asignation/operator-sofia-dashboard/`,
  },
  modalityProductiveStage :{
    getModalityProductiveStage : `${API_BASE_URL}assign/modality_productive_stage/`,
  },
  legalDocument :{
    allLegalDocument : `${API_BASE_URL}general/legal-documents/`,
    idLegalDocument : `${API_BASE_URL}general/legal-documents/{id}/`,
    softDeleteLegalDocument : `${API_BASE_URL}general/legal-documents/{id}/soft-delete/`,
    filterLegalDocument : `${API_BASE_URL}general/legal-documents/filter/`,
  },
  legalSection :{
    allLegalSection: `${API_BASE_URL}general/legal-sections/`,
    idLegalSection : `${API_BASE_URL}general/legal-sections/{id}/`,
    softDeleteLegalSection : `${API_BASE_URL}general/legal-sections/{id}/soft-delete/`,
    filterLegalSection : `${API_BASE_URL}general/legal-sections/filter/`,
  },
  SupportContact:{
    allSupportContact : `${API_BASE_URL}general/support-contacts/`,
    idSupportContact : `${API_BASE_URL}general/support-contacts/{id}/`,
    softDeleteSupportContact : `${API_BASE_URL}general/support-contacts/{id}/soft-delete/`,
    filterSupportContact : `${API_BASE_URL}general/support-contacts/filter/`,
  },
  SupportSchedule:{
    allSupportSchedule : `${API_BASE_URL}general/support-schedules/`,
    idSupportSchedule : `${API_BASE_URL}general/support-schedules/{id}/`,
    softDeleteSupportSchedule : `${API_BASE_URL}general/support-schedules/{id}/soft-delete/`,
    filterSupportSchedule : `${API_BASE_URL}general/support-schedules/filter/`,
  },
  // Endpoints for type of queries
  TypeOfQueries :{
    allTypeOfQueries : `${API_BASE_URL}general/type-of-queries/`,
    idTypeOfQueries : `${API_BASE_URL}general/type-of-queries/{id}/`,
    softDeleteTypeOfQueries : `${API_BASE_URL}general/type-of-queries/{id}/soft-delete/`,
    filterTypeOfQueries : `${API_BASE_URL}general/type-of-queries/filter/`,
  },
  // Endpoints for colors
  Colors :{
    allColors : `${API_BASE_URL}general/colors/`,
    idColors : `${API_BASE_URL}general/colors/{id}/`,
    softDeleteColors : `${API_BASE_URL}general/colors/{id}/soft-delete/`,
    filterColors : `${API_BASE_URL}general/colors/filter/`,
  },
  // Endpoints for contract type
  contractType: {
    allContractType: `${API_BASE_URL}general/type-contracts/`,
    idContractType: `${API_BASE_URL}general/type-contracts/{id}/`,
    softDelete: `${API_BASE_URL}general/type-contracts/{id}/soft-delete/`,
    filterContractType : `${API_BASE_URL}general/type-contracts/filter/`,
  },
  // Endpoints for document type
  documentType: {
    allDocumentType: `${API_BASE_URL}security/document-types/`,
    idDocumentType: `${API_BASE_URL}security/document-types/{id}/`,
    softDelete: `${API_BASE_URL}security/document-types/{id}/soft-delete/`,
    filterDocumentType : `${API_BASE_URL}security/document-types/filter/`,

  },

  AssignationInstructor :{
    getAllAssignationInstructor : `${API_BASE_URL}assign/asignation_instructor/`,
    getAssignationInstructorById : `${API_BASE_URL}assign/asignation_instructor/{id}/`,
    filterAssignationInstructor : `${API_BASE_URL}assign/asignation_instructor/filtered/`,
    reassignInstructor : `${API_BASE_URL}assign/asignation_instructor_history/reasignar-instructor/`,
  },
  Boss :{
    allBoss : `${API_BASE_URL}assign/boss/`,
    idBoss : `${API_BASE_URL}assign/boss/{id}/`,
    filterBoss : `${API_BASE_URL}assign/boss/by-enterprise/`,
},
Enterprise :{
    allEnterprise : `${API_BASE_URL}assign/enterprise/`,
    idEnterprise : `${API_BASE_URL}assign/enterprise/{id}/`,
},
  HumanTalent :{
    allHumanTalent : `${API_BASE_URL}assign/human_talent/`,
    idHumanTalent : `${API_BASE_URL}assign/human_talent/{id}/`,
    filterHumanTalent : `${API_BASE_URL}assign/human_talent/by-enterprise/`,
},
 Notification :{
    getNotifications : `${API_BASE_URL}general/notifications/`,
    markAsRead : `${API_BASE_URL}general/notifications/{id}/`,
    deleteNotification : `${API_BASE_URL}general/notifications/delete-by-id/`,
    DeleteAll : `${API_BASE_URL}general/notifications/delete-by-user/`,
  },

};


/**
 * Exports the base API URL for external use.
 */
export default API_BASE_URL;