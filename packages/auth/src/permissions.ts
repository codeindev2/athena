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
    cannot(['transfer_ownership', 'update'], 'Business') // Primeiro tirar a possibilidade de transferir a propriedade da organização
    can(['transfer_ownership', 'update'], 'Business', {
      ownerId: { $eq: user.id },
    }) // Depois dar permissão para transferir organizacao que pertence ao usuário
  },
  CLIENT(user, { can }) {
    can('get', 'User') // Pode criar projetos
    // can(['get', 'create'], 'Product') // Pode gerenciar projetos
    // can(['update', 'delete'], 'Product', { ownerId: { $eq: user.id } }) // Valida se o usuário é o dono do projeto
  },
  EMPLOYEE(_, { can }) {
    can('manage', 'User')
  },
  BILLING() {},
}
