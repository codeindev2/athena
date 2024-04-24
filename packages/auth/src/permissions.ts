import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { User } from './models/user'

type Role = 'ADMIN' | 'MEMBER'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_, { can }) {
    can('manage', 'all') // Pode gerenciar todos os recursos
  },
  MEMBER(_, { can }) {
    can('invite', 'User') // Pode convidar usuários
    can('manage', 'Project') // Pode gerenciar projetos
  },
}
