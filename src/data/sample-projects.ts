/**
 * @deprecated Import from `@/data/county-projects` instead.
 * Re-exports real OAG/CoB-sourced project records (no fictional samples).
 */
export {
  countyProjects,
  countyProjects as sampleProjects,
  getProjectById,
  getProjectsByCounty,
  getAllProjects,
  getStalledProjects,
  getProjectsByCategory,
} from './county-projects';
