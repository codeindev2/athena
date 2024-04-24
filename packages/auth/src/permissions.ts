import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { Role } from './models/roles'
import { User } from './models/user'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_, { can }) {
    can('manage', 'all') // Pode gerenciar todos os recursos
  },
  MEMBER(user, { can }) {
    // can('invite', 'User') // Pode convidar usuários
    can('manage', 'Project') // Pode gerenciar projetos
    can(['update'], 'Project', { ownerId: { $eq: user.id } }) // Valida se o usuário é o dono do projeto
  },
  BILLING() {},
}
