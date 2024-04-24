import { AbilityBuilder } from '@casl/ability'

import { AppAbility } from '.'
import { Role } from './models/roles'
import { User } from './models/user'

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>,
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(user, { can, cannot }) {
    can('manage', 'all') // Pode gerenciar todos os recursos
    cannot(['transfer_ownership', 'update'], 'Organization') // Primeiro tirar a possibilidade de transferir a propriedade da organização
    can(['transfer_ownership', 'update'], 'Organization', {
      ownerId: { $eq: user.id },
    }) // Depois dar permissão para transferir organizacao que pertence ao usuário
  },
  MEMBER(user, { can }) {
    can('get', 'User') // Pode criar projetos
    can(['get', 'create'], 'Project') // Pode gerenciar projetos
    can(['update', 'delete'], 'Project', { ownerId: { $eq: user.id } }) // Valida se o usuário é o dono do projeto
  },
  BILLING(user, { can }) {
    can('manage', 'Billing')
  },
}
