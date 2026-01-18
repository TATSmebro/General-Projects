import Header from './Header'

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  
  content: {
    flex: '1 1 auto',
    overflow: 'auto', // scroll if needed
    padding: '1rem',  // optional
  },
}

function MainContainer({ children, headerVisible = true, navVisible = true }) {
  return (
    <div style={styles.container}>
      {headerVisible && <Header navVisible={navVisible}/>}
      
      <main style={styles.content}>
        {children}
      </main>
    </div>
  )
}

export default MainContainer
