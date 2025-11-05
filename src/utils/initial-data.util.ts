import Role from '@/models/role.model'
import Permission from '@/models/permission.model'
import User from '@/models/user.model'
import roleData from '@/data/roles.json'
import permissionData from '@/data/permissions.json'
import userData from '@/data/users.json'
export default async () => {
  //Tạo role admin và user
  const [roles, permissions, users] = await Promise.all([
    Role.countDocuments({}),
    Permission.countDocuments({}),
    User.countDocuments({}),
  ])
  if (roles === 0) {
    await Role.insertMany(roleData)
  }
  if (permissions === 0) {
    await Permission.insertMany(permissionData)
  }
  if (users === 0) {
    await User.insertMany(userData)
  }
}
