'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Zap } from 'lucide-react';

// Define the Server type to match our usage
interface Server {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  banner: string | null;
  tag: string | null;
  byteeLevel: number;
  boostLevel: number;
  ownerId: string;
  isDefault: boolean;
  advertisementEnabled: boolean;
  advertisementText: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ServerCardProps {
  server: Server & {
    _count?: {
      members?: number;
    };
  };
  showBoostStatus?: boolean;
  className?: string;
}

export function ServerCard({ server, showBoostStatus = true, className = '' }: ServerCardProps) {
  return (
    <Link 
      href={`/dash/${server.ownerId}/servers/${server.id}`}
      className={`block group relative rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 ${className}`}
    >
      {server.banner && (
        <div className="h-32 relative">
          <Image
            src={server.banner}
            alt={`${server.name} banner`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {server.boostLevel > 0 && showBoostStatus && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>Level {server.boostLevel}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0">
            {server.icon ? (
              <Image
                src={server.icon}
                alt={server.name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                {server.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            {server.byteeLevel > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-gray-900">
                {server.byteeLevel}
              </div>
            )}
          </div>
          
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{server.name}</h3>
            {server._count?.members !== undefined && (
              <p className="text-xs text-gray-400">{server._count.members} member{server._count.members !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>
        
        {server.boostLevel > 0 && showBoostStatus && !server.banner && (
          <div className="mt-2 flex items-center gap-1 text-xs text-purple-400">
            <Zap className="h-3 w-3" />
            <span>Boost Level {server.boostLevel}</span>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
        <button 
          className="w-full py-1.5 px-3 bg-white/10 backdrop-blur-sm rounded text-sm font-medium text-white hover:bg-white/20 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            // Open server settings with boosts tab active
            window.location.href = `/dash/${server.ownerId}/servers/${server.id}/settings`;
          }}
        >
          Manage Server
        </button>
      </div>
    </Link>
  );
}
