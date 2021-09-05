/*Vue UI */
const vm = new Vue({
  el: '#zentalk',
  data() {
    return {
      ZentalkWorker: null,
      socket: null,
      originPublicKey: null,
      destinationPublicKey: null,
      messages: [],
      notifications: [],
      currentRoom: null,
      pendingRoom: Math.floor(Math.random() * 1000 * 100),
      draft: '',
      address: null,
      data: {userCount: 0}
    };
  },
  async created() {
    this.addNotification('Welcome Zentalk-Web!');
    this.addNotification('Please Wait Zentalk Generating New Key-Pair...');
    this.ZentalkWorker = new Worker('zentalk-worker.js');
    this.originPublicKey = await this.getWebWorkerResponse('generate-keys');
    this.addNotification(
      `Keypairs Are Now Generated: ${this.getKeyShorted(this.originPublicKey)}`
    );
    this.addNotification('User see only the Public-Key');
    this.socket = io();
    this.setupSocketListeners();
  },
  methods: {
    setupSocketListeners() {
      this.socket.on('connect', () => {
        this.addNotification('Safe Connected With Zentalk');
        this.joinRoom();
      });

      this.socket.on('disconnect', () =>
        this.addNotification('Zentalk Lost Connection')
      );
      
      this.socket.on('MESSAGE', async message => {
        if (message.recipient === this.originPublicKey) {
          message.text = await this.getWebWorkerResponse(
            'decrypt',
            message.text
          );
          this.messages.push(message);
        }
      });

      this.socket.on('NEW_CONNECTION', () => {
        this.addNotification('Another User Has Joined The Room');
        this.sendPublicKey();
      });

      this.socket.on('ROOM_JOINED', newRoom => {
        this.currentRoom = newRoom;
        this.addNotification(
          `User Have Joined The Zentaroom - ${this.currentRoom}`
        );
        this.sendPublicKey();
      });

      this.socket.on('PUBLIC_KEY', key => {
        this.addNotification(
          `Public Key Received - ${this.getKeyShorted(key)}`
        );
        this.destinationPublicKey = key;
      });

      this.socket.on('user disconnected', () => {
        this.notify(
          `The User is Disconnected - ${this.getKeyShorted(
            this.destinationKey
          )}`
        );
        this.destinationPublicKey = null;
      });

      this.socket.on('ROOM_FULL', () => {
        this.addNotification(
          `Cannot Join ${this.pendingRoom}, Zentaroom is full`
        );
        this.pendingRoom = Math.floor(Math.random() * 1000 * 10);
        this.joinRoom();
      });

      this.socket.on('INTRUSION_ATTEMPT', () => {
        this.addNotification(
          'Sorry Third User are attempted to join the Zentarooms'
        );
      });
    },

    async sendMessage() {
      if (!this.draft || this.draft === '') {
        return;
      }
      let message = Immutable.Map({
        text: this.draft,
        recipient: this.destinationPublicKey,
        sender: this.originPublicKey
      });
      this.draft = '';
      this.addMessage(message.toObject());

      if (this.destinationPublicKey) {
        const encryptedText = await this.getWebWorkerResponse('encrypt', [
          message.get('text'),
          this.destinationPublicKey
        ]);
        const encryptedMsg = message.set('text', encryptedText);
        this.socket.emit('MESSAGE', encryptedMsg.toObject());
      }
    },

    joinRoom() {
      if (this.pendingRoom !== this.currentRoom && this.originPublicKey) {
        this.addNotification(`Connecting to Zentaroom - ${this.pendingRoom}`);
        this.messages = [];
        this.destinationPublicKey = null;
        this.socket.emit('JOIN', this.pendingRoom);
      }
    },

    addMessage(message) {
      this.messages.push(message)
      this.autoscroll(this.$refs.chatView);
    },

    addNotification(message) {
      const timestamp = new Date().toLocaleTimeString();
      this.notifications.push({
        message,
        timestamp
      });
      this.autoscroll(this.$refs.notificationContainer);
    },

    getWebWorkerResponse(messageType, messagePayload) {
      return new Promise((resolve) => {
        const messageId = Math.floor(Math.random() * 100000 * 10);
        this.ZentalkWorker.postMessage(
          [messageType, messageId].concat(messagePayload)
        );
        const handler = function(e) {
          if (e.data[0] === messageId) {
            e.currentTarget.removeEventListener(e.type, handler);
            resolve(e.data[1]);
          }
        };
        this.ZentalkWorker.addEventListener('message', handler);
      });
    },

    sendPublicKey() {
      if (this.originPublicKey) {
        this.socket.emit('PUBLIC_KEY', this.originPublicKey);
      }
    },

    getKeyShorted(key) {
      return key.slice(400, 416, 432);
    },

    autoscroll(element) {
      if (element) {
        element.scrollTop = element.scrollHeight
      }
    },
  }
});
