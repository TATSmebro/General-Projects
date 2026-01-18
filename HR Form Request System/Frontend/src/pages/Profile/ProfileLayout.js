
function Layout({ sidebar, main }) {
  const containerStyle = {
    height: '85vh',
    display: 'flex',
  };

  const sidebarStyle = {
    flex: '0 0 30%',
    borderRight: '5px solid #EE9337',
    height: '99.5%',
  };

  const mainStyle = {
    flex: '0 0 70%',
    padding: '2rem',
  };

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        {sidebar}
      </div>
      <div style={mainStyle}>
        {main}
      </div>
    </div>
  )
}

export default Layout
