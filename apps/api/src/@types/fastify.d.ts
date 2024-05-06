import 'fastify'
// Usado para incluir funçes no request
declare module 'fastify' {
  export interface FastifyRequest {
    getCurrentUserId(): Promise<string>
    getUserMembership(slug: string): Promise<{
      business: Business
      membership: MemberShip
    }>
  }
}
  