import { useState, useEffect } from 'react'
import styles from './CollectionPage.module.css'
import { supabase } from '../../supabase'

export default function CollectionPage({ user }) {
  const [collection, setCollection] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCollection() {
      const { data } = await supabase
        .from('collection')
        .select('*')
        .eq('user_id', user.id)
      setCollection(data || [])
      setLoading(false)
    }
    if (user) fetchCollection()
  }, [user])

  async function handleRemove(cardId) {
    const { error } = await supabase
      .from('collection')
      .delete()
      .eq('card_id', cardId)
      .eq('user_id', user.id)

    if (error) {
      console.log('Remove error:', error)
      return
    }

    setCollection((prev) => prev.filter((c) => c.card_id !== cardId))
  }

  const totalValue = collection.reduce((sum, card) => sum + (card.price || 0), 0)

  return (
    <div className={styles.wrapper}>
      <div className={styles.totalCard}>
        <p className={styles.totalLabel}>Total portfolio value</p>
        <p className={styles.totalValue}>
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>

      {loading ? (
        <p className={styles.emptyText}>Loading...</p>
      ) : collection.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Start adding cards to your collection!</p>
        </div>
      ) : (
        <div className={styles.glassContainer}>
          <div className={styles.grid}>
            {collection.map((card) => (
              <div className={styles.card} key={card.id}>
                <img
                  className={styles.cardImg}
                  src={card.image}
                  alt={card.name}
                />
                <p className={styles.cardName}>{card.name}</p>
                <p className={styles.cardPrice}>
                  {card.price ? `$${card.price.toFixed(2)}` : 'N/A'}
                </p>
                <button
                  className={styles.removeBtn}
                  onClick={() => handleRemove(card.card_id)}
                >
                  -
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}