import React, { useEffect, useRef } from 'react'
import { User, MessageSquare, Shield, UserMinus, Ban, VolumeX, Crown } from 'lucide-react'
import { usePermissions } from '../hooks/usePermissions'

interface MemberContextMenuProps {
    x: number
    y: number
    memberId: string
    memberName: string
    serverId: string
    onClose: () => void
    onViewProfile: () => void
    onSendMessage: () => void
    onKick: () => void
    onBan: () => void
    onMute: () => void
}

export function MemberContextMenu({
    x,
    y,
    memberId,
    memberName,
    serverId,
    onClose,
    onViewProfile,
    onSendMessage,
    onKick,
    onBan,
    onMute
}: MemberContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const { hasPermission, PERMISSIONS } = usePermissions(serverId)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    // Adjust position to keep menu on screen
    const style = {
        top: Math.min(y, window.innerHeight - 300),
        left: Math.min(x, window.innerWidth - 220)
    }

    return (
        <div
            ref={menuRef}
            className="fixed z-50 w-56 bg-[#111113] border border-[#1e1f22] rounded-lg shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
            style={style}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="px-2 py-1.5 border-b border-[#1e1f22] mb-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 truncate">
                    {memberName}
                </h4>
            </div>

            <div className="px-1 space-y-0.5">
                <button
                    onClick={onViewProfile}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-200 hover:bg-[#4752c4] hover:text-white rounded transition-colors"
                >
                    <User className="w-4 h-4" />
                    Profile
                </button>
                <button
                    onClick={onSendMessage}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-200 hover:bg-[#4752c4] hover:text-white rounded transition-colors"
                >
                    <MessageSquare className="w-4 h-4" />
                    Message
                </button>
            </div>

            {(hasPermission(PERMISSIONS.KICK_MEMBERS) || hasPermission(PERMISSIONS.BAN_MEMBERS)) && (
                <>
                    <div className="my-1 border-t border-[#1e1f22]" />
                    <div className="px-1 space-y-0.5">
                        {hasPermission(PERMISSIONS.KICK_MEMBERS) && (
                            <button
                                onClick={onKick}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                            >
                                <UserMinus className="w-4 h-4" />
                                Kick Member
                            </button>
                        )}
                        {hasPermission(PERMISSIONS.BAN_MEMBERS) && (
                            <button
                                onClick={onBan}
                                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 hover:bg-red-500 hover:text-white rounded transition-colors"
                            >
                                <Ban className="w-4 h-4" />
                                Ban Member
                            </button>
                        )}
                        <button
                            onClick={onMute}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-200 hover:bg-[#4752c4] hover:text-white rounded transition-colors"
                        >
                            <VolumeX className="w-4 h-4" />
                            Mute Member
                        </button>
                    </div>
                </>
            )}

            <div className="my-1 border-t border-[#1e1f22]" />
            <div className="px-1">
                <button
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-200 hover:bg-[#4752c4] hover:text-white rounded transition-colors"
                >
                    <Shield className="w-4 h-4" />
                    Roles
                </button>
            </div>
        </div>
    )
}
