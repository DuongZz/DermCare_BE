// cache-keys/permission.cache.ts
export const PermissionCacheKeyId = {
  byId: (id: string) => `permission:id:/api/v1/permission/${id}`,
}

// cache-keys/role.cache.ts
export const RoleCacheKeyId = {
  byId: (id: string) => `role:id:/api/v1/role/${id}`,
}
