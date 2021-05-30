import { useState, FormEvent, useContext } from 'react';

import styles from '../styles/Home.module.css'

import { AuthContext } from '../contexts/AuthContext';

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container} >
      <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" />
      <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" />
      <button type="submit">Entrar</button>
    </form>
  )
}