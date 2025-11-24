'use client'

import React from 'react'
import './ProfileCard.css'

interface ProfileCardProps {
  avatarUrl: string
  name: string
  username?: string
  role?: string
  status?: string
  badges?: string[]
  memberSince?: string
  className?: string
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  avatarUrl,
  name,
  username,
  role = 'Member',
  status = 'Online',
  badges = [],
  memberSince,
  className = ''
}) => {
  return (
    <div className={`profile-card-wrapper ${className}`.trim()}>
      <section className="profile-card">
        <div className="profile-inside">
          <div className="profile-shine" />
          <div className="profile-glare" />
          
          {/* Avatar Content */}
          <div className="profile-content profile-avatar-content">
            <img
              className="profile-avatar"
              src={avatarUrl}
              alt={`${name} avatar`}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
            
            {/* User Info Bar */}
            <div className="profile-user-info">
              <div className="profile-user-details">
                <div className="profile-mini-avatar">
                  <img
                    src={avatarUrl}
                    alt={`${name} mini avatar`}
                    loading="lazy"
                  />
                </div>
                <div className="profile-user-text">
                  <div className="profile-handle">@{username || name.toLowerCase()}</div>
                  <div className="profile-status">
                    <span className={`status-dot ${status.toLowerCase()}`}></span>
                    {status}
                  </div>
                </div>
              </div>
              
              {role && (
                <div className="profile-role-badge" style={{ backgroundColor: role === 'ADMIN' ? '#f23f43' : '#5865f2' }}>
                  {role}
                </div>
              )}
            </div>
          </div>
          
          {/* Name and Title */}
          <div className="profile-content profile-details-content">
            <div className="profile-details">
              <h3>{name}</h3>
              {badges && badges.length > 0 && (
                <div className="profile-badges">
                  {badges.map((badge, i) => (
                    <span key={i} className="badge">{badge}</span>
                  ))}
                </div>
              )}
              {memberSince && (
                <p className="profile-member-since">Member since {memberSince}</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ProfileCard
