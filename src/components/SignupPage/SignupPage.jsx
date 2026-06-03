import { useState } from "react";
import { supabase } from "../../supabase";
import styles from './SignupPage.module.css'

export default function SignupPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);

    if (!identifier || !password) return setError("Fill in all fields");
    if (!isLogin && !username) return setError("Fill in all fields");
    if (!isLogin && password !== confirmPassword) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);

    if (isLogin) {
      const isEmail = identifier.includes('@')
      let email = identifier

      if (!isEmail) {
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', identifier)
          .single()

        if (error || !data) {
          setLoading(false)
          return setError("Username not found")
        }
        email = data.email
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
      if (loginError) {
        setLoading(false)
        return setError(loginError.message)
      }

    } else {
      // check username availability first
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single()

      if (existing) {
        setLoading(false)
        return setError("Username already taken")
      }

      // create auth account
      const { data, error: signupError } = await supabase.auth.signUp({
        email: identifier,
        password
      })

      if (signupError) {
        setLoading(false)
        return setError(signupError.message)
      }

      // save profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        email: identifier
      })

      if (profileError) {
        setLoading(false)
        return setError(profileError.message)
      }
    }

    setLoading(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSubmit();
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.header}>
          <h1 className={styles.title}>PokeSearch</h1>
          <p className={styles.subtitle}>
            {isLogin ? "Log in to your account" : "Create an account"}
          </p>
        </div>

        <div className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder={isLogin ? "Email or username" : "Email"}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {!isLogin && (
            <input
              className={styles.input}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {!isLogin && (
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.button}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : isLogin ? "Log in" : "Sign up"}
        </button>

        <p className={styles.toggle}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>

      </div>
    </div>
  );
}