import React from 'react';
export default class SideBar extends React.Component {
            
    render() {
        return <div  className="info-container full-width">
            {
                this.props.viewInfo ?
                    <div>
                        <div id="chatjoin">
                            <div className="room-select">
                                <input 
                                    type="text" 
                                    className="room-id" 
                                    placeholder="Choose Room" 
                                    id="room-id" 
                                    name="Choose Room"
                                    value={this.props.pendingRoom}
                                    onChange={this.props.onChange} 
                                    onKeyDown={this.props.onKeyDown}
                                />
                            </div>
                        </div>
                        <div className="room-btn">
                            <input 
                                className="join-button" 
                                type="submit" 
                                onClick={this.props.handleClickDown}  
                                value="JOIN"
                                name="JOIN"
                            />
                        </div>
                        <div className="divider"></div>
                        <div className="notification-list" ref="notificationContainer">
                        {
                            this.props.notifications.length !=0 ? 
                            this.props.notifications.map((item,i) => 
                                    <div key={i} className={(i%2 == 0 )?"notification left-align":"notification half-width"}>
                                        <div className={i%2 == 0 ?"notification-timestamp ":"notification-message"}>{item}</div>
                                    </div> 
                                ):""
                        }
                        </div>
                        <div className="flex-fill"></div>
                        <div className="divider"></div>
                        
                        <div className="keys full-width">
                            <div className="user2_Key">
                            {
                                this.props.destinationPublicKey? 
                                <div className="input-wrap">
                                    <input type="checkbox" onClick={this.props.handleClickDown} className="publicKey--visibleToggle" checked />
                                    <div className="publicKey--background"></div>
                                    {
                                        this.props.viewInfo?
                                            <div className="publicKey--visibleToggle-eye open">
                                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/138980/eye-open.png" />
                                            </div>
                                        :
                                            <div>
                                                <div className="publicKey--visibleToggle-eye open">
                                                    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/138980/eye-open.png" />
                                                </div>
                                                <div className="publicKey--visibleToggle-eye close">
                                                    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/138980/eye-close.png" />
                                                </div>
                                            </div>
                                    }

                                    <h3>THEIR PUBLIC KEY & IDENTIFICATION - { this.props.getKeyShorted(this.props.destinationPublicKey)}</h3>
                                    <p>{this.props.destinationPublicKey}</p>
                                </div>
                                :
                                <h4>Waiting for second user to join room...</h4>
                            }
                            </div>

                            <div className="dividerkey"></div>

                            <div className="user1_Key">
                            {
                                this.props.originPublicKey ? <div>
                                    <h3>YOUR PUBLIC KEY & IDENTIFICATION - {this.props.getKeyShorted(this.props.originPublicKey)}</h3>
                                    <p>{this.props.originPublicKey}</p>
                                </div> 
                                :                         
                                <div className="keypair-loader full-width">
                                    <div className="loader"></div>
                                </div>
                            }
                            </div>
                        </div>
                    </div>
                :
                    <div>
                        <div className="keys full-width">
                            <div className="user2_Key">
                            {
                                this.props.destinationPublicKey? 
                                <div className="input-wrap">
                                    <input 
                                        type="checkbox" 
                                        onClick={this.props.handleClickDown} 
                                        className="publicKey--visibleToggle" 
                                        checked 
                                    />
                                    <div className="publicKey--background"></div>
                                    {
                                        this.props.viewInfo?
                                            <div className="publicKey--visibleToggle-eye open">
                                                <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/138980/eye-open.png" />
                                            </div>
                                        :
                                            <div>
                                                <div className="publicKey--visibleToggle-eye open">
                                                    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/138980/eye-open.png" />
                                                </div>
                                                <div className="publicKey--visibleToggle-eye close">
                                                    <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/138980/eye-close.png" />
                                                </div>
                                            </div>
                                    }
                                </div>
                                :
                                ''
                            }
                            </div>
                            <div className="dividerkey"></div>
                        </div>
                    </div>
            }
        </div>
    }
}