import React from "react";
import Api from "../../data/Api";

class Console extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      console: false,
    };

    this.getConsole = this.getConsole.bind(this);
    this.filter = this.filter.bind(this);
  }
  componentDidMount() {
    this.heartbeat = setInterval(() => this.getConsole(), 1000);
  }

  async getConsole() {
    let data = await Api.getConsole();
    let conData = {};
    if (data) {
      Object.keys(data).map((key) => {
        let item = data[key];
        let ts = Object.keys(item)[0];
        let content = item[ts];
        conData[ts] = content;
      });
    }
    this.setState({
      console: conData,
    });
  }

  componentWillUnmount() {
    clearInterval(this.heartbeat);
  }

  filter(type) {
    let filterType = `filter_${type}`;
    this.setState({
      [filterType]: this.state[filterType] ? false : true,
    });
  }

  render() {
    let filterActive =
      this.state.filter_info ||
      this.state.filter_warn ||
      this.state.filter_error ||
      this.state.filter_verbose;
    return (
      <div className="console--wrap">
        <section>
          <p className="main-title mb--2">Debug Console</p>
          <div className="console--filter">
            <div
              className={`console--filter--item console--filter--item__info ${
                this.state.filter_info ? "" : "disabled"
              }`}
              onClick={() => this.filter("info")}
            >
              Info
            </div>
            <div
              className={`console--filter--item console--filter--item__warn ${
                this.state.filter_warn ? "" : "disabled"
              }`}
              onClick={() => this.filter("warn")}
            >
              Warning
            </div>
            <div
              className={`console--filter--item console--filter--item__error ${
                this.state.filter_error ? "" : "disabled"
              }`}
              onClick={() => this.filter("error")}
            >
              Error
            </div>
            <div
              className={`console--filter--item console--filter--item__verbose ${
                this.state.filter_verbose ? "" : "disabled"
              }`}
              onClick={() => this.filter("verbose")}
            >
              Verbose
            </div>
          </div>
          <div className="console--main">
            {this.state.console
              ? Object.keys(this.state.console)
                  .reverse()
                  .map((ts) => {
                    let data = this.state.console[ts];
                    let timestamp = ts;
                    let type = data.type;
                    let message = data.log;
                    if (typeof message === "object" && message !== null)
                      message = JSON.stringify(message);
                    if (filterActive && !this.state[`filter_${type}`])
                      return null;
                    return (
                      <p
                        key={`con__${timestamp}_${message}`}
                        className={`console--item console--item__${type}`}
                      >
                        [{new Date(timestamp).toLocaleString()}] ::{" "}
                        <span
                          className={`console--type console--type__${type}`}
                        >
                          {type}
                        </span>{" "}
                        :: {message}
                      </p>
                    );
                  })
              : null}
          </div>
        </section>
      </div>
    );
  }
}

export default Console;
