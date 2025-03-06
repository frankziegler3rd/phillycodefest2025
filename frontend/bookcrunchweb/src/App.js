import './styles/App.css';
import Chat from './components/chat.js';
import Dash from './components/dash.js';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Dash />
        {/* <Chat bookId="1" charName=""/> */}
      </header>
    </div>
  );
}

export default App;
