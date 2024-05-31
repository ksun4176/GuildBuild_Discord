import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

interface AppProps {}
interface AppState {
  apiResponse: string
}

class App extends Component<AppProps, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = { apiResponse: "" };
  }

  async callAPI() {
    try {
      const response: Response = await fetch("http://localhost:9000/testAPI");
      const text: string = await response.text();
      this.setState({ apiResponse: text });
    }
    catch (err) {
      console.log(err);
    }
  }

  override componentWillMount() {
      this.callAPI();
  }

  override render(): React.JSX.Element {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
        <p className="App-intro">{this.state.apiResponse}</p>
      </div>
    );
  }
}

export default App;
