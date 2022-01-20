import React from "react";

class Modal extends React.Component {
  render() {
    return (
      <div className={`modal--wrap ${this.props.open ? "active" : ""}`}>
        <div className="modal--inner">
          <div className="modal--top">
            <h3>{this.props.title}</h3>
          </div>
          <div className="modal--main">
            <section>{this.props.children}</section>
            <div className="modal-btns">
              {this.props.submit ? (
                <div className="btn btn__square save-modal" onClick={this.props.submit}>
                  {this.props.submitText ? this.props.submitText : "Submit"}
                </div>
              ) : (
                <div className="btn btn__square disabled">{this.props.submitText ? this.props.submitText : "Submit"}</div>
              )}
              <div className="btn btn__square bad" onClick={this.props.close}>
                Cancel
              </div>
              {this.props.delete ? (
                <div className="btn btn__square bad delete-modal" onClick={this.props.delete}>
                  {this.props.deleteText ? this.props.deleteText : "Delete"}
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
