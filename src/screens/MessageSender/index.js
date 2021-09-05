import React from 'react';
export default class MessageSender extends React.Component {
    render() {
        return <div className="bottom-bar full-width" id="message-input">
                <div className="gradient-border">
                    <input 
                        className="message-input" 
                        type="text" 
                        placeholder="Your Message..." 
                        name="Send Msg"
                        onChange={this.props.onChange} 
                        onKeyDown={this.props.onKeyDown}
                        value={this.props.draft}
                    />
                </div>
            </div>
    }
}