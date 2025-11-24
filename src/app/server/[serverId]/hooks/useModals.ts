import { useState } from 'react'

export type ModalType = 
  | 'createCategory'
  | 'createChannel'
  | 'editChannel'
  | 'deleteChannel'
  | 'deleteCategory'
  | 'invite'
  | 'kickMember'
  | 'banMember'
  | 'muteMember'
  | null

interface ModalState {
  type: ModalType
  data?: any
}

export function useModals() {
  const [modalState, setModalState] = useState<ModalState>({ type: null })

  const openModal = (type: ModalType, data?: any) => {
    setModalState({ type, data })
  }

  const closeModal = () => {
    setModalState({ type: null })
  }

  return {
    modalState,
    openModal,
    closeModal,
    isOpen: (type: ModalType) => modalState.type === type
  }
}
