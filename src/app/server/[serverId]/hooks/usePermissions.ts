import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { Server, Member, Role } from '../types'

// Permission constants
export const PERMISSIONS = {
    ADMINISTRATOR: 'ADMINISTRATOR',
    MANAGE_CHANNELS: 'MANAGE_CHANNELS',
    MANAGE_ROLES: 'MANAGE_ROLES',
    KICK_MEMBERS: 'KICK_MEMBERS',
    BAN_MEMBERS: 'BAN_MEMBERS',
    CREATE_INVITE: 'CREATE_INVITE',
    SEND_MESSAGES: 'SEND_MESSAGES',
    CONNECT: 'CONNECT'
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function usePermissions(serverId: string) {
    const { data: session } = useSession()

    // Fetch data using SWR for caching and real-time updates
    const { data: server } = useSWR<Server>(
        serverId ? `/api/servers/${serverId}` : null,
        fetcher
    )

    const { data: members } = useSWR<Member[]>(
        serverId ? `/api/servers/${serverId}/members` : null,
        fetcher
    )

    const { data: roles } = useSWR<Role[]>(
        serverId ? `/api/servers/${serverId}/roles` : null,
        fetcher
    )

    // Calculate permissions
    const currentMember = members?.find(m => m.userId === session?.user?.id)
    const isOwner = server?.ownerId === session?.user?.id

    let permissions: string[] = []

    if (isOwner) {
        permissions = Object.values(PERMISSIONS)
    } else if (currentMember && roles) {
        // Add default permissions
        permissions = [PERMISSIONS.SEND_MESSAGES, PERMISSIONS.CONNECT, PERMISSIONS.CREATE_INVITE]

        // Add role-based permissions
        if (currentMember.roles && currentMember.roles.length > 0) {
            currentMember.roles.forEach(roleId => {
                const role = roles.find(r => r.id === roleId)
                if (role && role.permissions) {
                    try {
                        // Handle both JSON array and comma-separated string
                        const rolePerms = role.permissions.startsWith('[')
                            ? JSON.parse(role.permissions)
                            : role.permissions.split(',')
                        permissions = [...permissions, ...rolePerms]
                    } catch (e) {
                        console.error('Failed to parse permissions for role', role.name)
                    }
                }
            })
        }

        // Remove duplicates
        permissions = [...new Set(permissions)]
    }

    const hasPermission = (permission: string) => {
        if (!session?.user) return false
        if (isOwner) return true
        return permissions.includes(permission) || permissions.includes(PERMISSIONS.ADMINISTRATOR)
    }

    return {
        hasPermission,
        isOwner: !!isOwner,
        loading: !server && !members,
        PERMISSIONS
    }
}
