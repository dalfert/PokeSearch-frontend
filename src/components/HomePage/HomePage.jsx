import { useState, useEffect } from 'react'
import styles from './HomePage.module.css'
import SearchIcon from '../../icons/SearchIcon'
import CollectionIcon from '../../icons/CollectionIcon'
import { supabase } from '../../supabase'
import SearchBar from '../SearchBar/SearchBar'
import CollectionPage from '../CollectionPage/CollectionPage'

export default function HomePage({ user }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const [deleteInput, setDeleteInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const initial = profile?.username?.charAt(0).toUpperCase()

  useEffect(() => {
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('id', user.id)
        .single()
      setProfile(data)
    }
    if (user) fetchProfile()
  }, [user])

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function handleDeleteAccount() {
    if (deleteInput !== 'DELETE') return
    const { error } = await supabase.rpc('delete_user')
    if (error) alert(error.message)
    else await supabase.auth.signOut()
  }

  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <span className={styles.logo}>PokeSearch</span>
        <div className={styles.navIcons}>
          <button className={styles.iconBtn} onClick={() => setSearchOpen(true)}>
            <SearchIcon />
          </button>
          <button className={styles.iconBtn} onClick={() => setSearchOpen(false)}>
            <CollectionIcon />
          </button>
          <div className={styles.avatar} onClick={() => setModalOpen(true)}>
            {initial}
          </div>
        </div>
      </nav>

      {searchOpen ? (
        <SearchBar user={user} />
      ) : (
        <CollectionPage user={user} />
      )}

      {modalOpen && (
        <div className={styles.overlay} onClick={() => { setModalOpen(false); setShowDeleteConfirm(false); setDeleteInput('') }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

            <div className={styles.profileHeader}>
              <div className={styles.modalAvatar}>{initial}</div>
              <div className={styles.profileInfo}>
                <p className={styles.username}>{profile?.username}</p>
                <p className={styles.email}>{profile?.email}</p>
              </div>
            </div>

            {showDeleteConfirm ? (
              <div className={styles.deleteConfirm}>
                <p className={styles.deleteWarning}>Type <strong>DELETE</strong> to confirm</p>
                <input
                  className={styles.deleteInput}
                  type="text"
                  placeholder="DELETE"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                />
                <div className={styles.modalActions}>
                  <button className={styles.actionBtn} onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}>
                    Cancel
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={handleDeleteAccount}
                    disabled={deleteInput !== 'DELETE'}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.modalActions}>
                <button className={styles.actionBtn} onClick={handleLogout}>Log out</button>
                <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => setShowDeleteConfirm(true)}>
                  Delete account
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}