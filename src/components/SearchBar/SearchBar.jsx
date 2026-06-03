import { useState, useEffect } from 'react'
import styles from './SearchBar.module.css'
import SearchIcon from '../../icons/SearchIcon'
import { supabase } from '../../supabase'

export default function SearchBar({ user }) {
  const [query, setQuery] = useState('')
  const [searchedQuery, setSearchedQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)
  const [added, setAdded] = useState({})

  useEffect(() => {
    async function fetchCollection() {
      const { data } = await supabase
        .from('collection')
        .select('card_id')
        .eq('user_id', user.id)

      if (data) {
        const addedMap = {}
        data.forEach((item) => {
          addedMap[item.card_id] = true
        })
        setAdded(addedMap)
      }
    }

    if (user) fetchCollection()
  }, [user])

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
  }

  function getPrice(card) {
    if (card.productType === 'sealed') {
      const unopened = card.prices?.tcgplayer?.UNOPENED?.avg
      return unopened ? `$${unopened.toFixed(2)}` : 'N/A'
    }
    const tcg = card.prices?.tcgplayer?.NEAR_MINT?.avg
    const ebay = card.prices?.ebay?.NEAR_MINT?.avg
    if (tcg) return `$${tcg.toFixed(2)}`
    if (ebay) return `$${ebay.toFixed(2)}`
    return 'N/A'
  }

  function getRawPrice(card) {
    if (card.productType === 'sealed') {
      return card.prices?.tcgplayer?.UNOPENED?.avg ?? null
    }
    return card.prices?.tcgplayer?.NEAR_MINT?.avg
      ?? card.prices?.ebay?.NEAR_MINT?.avg
      ?? null
  }

  async function handleAdd(card) {
    if (added[card.id]) {
      const { error } = await supabase
        .from('collection')
        .delete()
        .eq('card_id', card.id)
        .eq('user_id', user.id)

      if (error) {
        console.log('Remove error:', error)
        return
      }

      setAdded((prev) => ({ ...prev, [card.id]: false }))
    } else {
      const { error } = await supabase.from('collection').insert({
        user_id: user.id,
        card_id: card.id,
        name: card.name,
        image: card.image,
        price: getRawPrice(card),
        product_type: card.productType
      })

      if (error) {
        console.log('Add error:', error)
        return
      }

      setAdded((prev) => ({ ...prev, [card.id]: true }))
    }
  }

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    setResults([])
    setSearched(false)

    try {
      const response = await fetch(`http://localhost:3001/cards/${query}`)
      const data = await response.json()
      console.log('PokéTrace response:', data)
      setResults(data.data || [])
    } catch (err) {
      console.log('Error:', err)
      setError('Something went wrong')
    }

    setSearchedQuery(query)
    setSearched(true)
    setLoading(false)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchRow}>
        <div className={styles.searchBar}>
          <SearchIcon className={styles.icon} stroke="#aaaaaa" />
          <input
            className={styles.input}
            type="text"
            placeholder="Search Pokémon cards..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <button className={styles.searchBtn} onClick={handleSearch}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {searched && results.length === 0 && !error && (
        <p className={styles.noResults}>No cards found for "{searchedQuery}"</p>
      )}

      {results.length > 0 && (
        <div className={styles.glassContainer}>
          <div className={styles.grid}>
            {results.map((card) => (
              <div className={styles.card} key={card.id}>
                <img
                  className={styles.cardImg}
                  src={card.image}
                  alt={card.name}
                />
                <p className={styles.cardName}>{card.name}</p>
                <p className={styles.cardPrice}>{getPrice(card)}</p>
                <button
                  className={added[card.id] ? styles.addedBtn : styles.addBtn}
                  onClick={() => handleAdd(card)}
                >
                  {added[card.id] ? '-' : '+'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}