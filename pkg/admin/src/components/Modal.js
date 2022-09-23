import React from 'react';

class Modal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disableSubmit: false,
    };

    this.onSubmitHandler = this.onSubmitHandler.bind(this);
  }

  async onSubmitHandler() {
    if (!this.state.disableSubmit) {
      this.setState({disableSubmit: true});
      await this.props.submit();
      this.setState({disableSubmit: false});
    }
  }

  render() {
    return (
      <div className={`modal--wrap ${this.props.open ? 'active' : ''}`}>
        <div className="modal--inner">
          <div className="modal--top">
            <h3>{this.props.title}</h3>
          </div>
          <div className="modal--main">
            <section>{this.props.children}</section>
            <div className="modal-btns">
              {this.props.submit ? (
                <div
                  className={`btn btn__square save-modal ${this.state.disableSubmit ? 'disabled' : ''}`}
                  onClick={this.onSubmitHandler}
                >
                  {this.props.submitText ? this.props.submitText : 'Submit'}
                </div>
              ) : (
                <div className={`btn btn__square disable`}>
                  {this.props.submitText ? this.props.submitText : 'Submit'}
                </div>
              )}
              <div className="btn btn__square bad" onClick={this.props.close}>
                {this.props.closeText ? this.props.closeText : 'Cancel'}
              </div>
              {this.props.delete ? (
                <div
                  className={`btn btn__square bad delete-modal ${this.state.disableSubmit ? 'disabled' : ''}`}
                  onClick={this.props.delete}
                >
                  {this.props.deleteText ? this.props.deleteText : 'Delete'}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Modal;
