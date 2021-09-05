import React from 'react';

export default class MessageList extends React.Component {

    render() {
        var messageListObj = this;
        return <div className="message-list" ref={this.props.chatView}>
            <div className="message full-width" >
                {
                    this.props.messages.map(function (message, i) {
                        return <p key={i}>
                            <span className={(message.sender == messageListObj.props.orgPkey) ? 'user1' : 'user2'}>
                                {messageListObj.props.getKeyShorted(message.sender)}
                            </span>
                                &#10148; {message.text}
                        </p>
                    })
                }
            </div>
        </div>
    }
}