# Helport Assistant Documentation

The `Assistant` is a core part of the assistant service, providing functionalities such as logging in, managing call services, and interacting with AI WebSocket connections. This class is built using `EventEmitter` to allow asynchronous event-driven communication.

## 1. Creating an Instance of `Assistant`

To create an instance of the `Assistant` class, you need to provide an options object with the `origin` URL.

### Syntax:

```typescript
const assistant = new Assistant(options: AssistantService.InitOptions);
```

### Parameters:

- `options`: An object of type `AssistantService.InitOptions` that must include the `origin` URL of the service.

### Example:

```typescript
import Assistant from "helport-assistant";

const assistant = new Assistant({
  origin: "https://api.example.com",
});
```

---

## 2. `login` Method

The `login` method is used to authenticate the user and initialize the assistant by retrieving user information.

### Syntax:

```typescript
login(passport: AssistantService.Passport): Promise<AssistantService.UserInfo>;
```

### Parameters:

- `passport`: An object containing:
  - `token`: The authentication token (string, required).
  - `bizID`: The business ID (string, required).

### Return Type:

- Returns a `Promise` that resolves to `AssistantService.UserInfo`, which contains the authenticated user's information.

### Errors:

- `Error`:
  - If the `passport.token` or `passport.bizID` is missing.
  - If the API response does not return a successful status (code !== 0).

### Example:

```typescript
const passport = {
  token: "user_token",
  bizID: "business_id",
};

assistant
  .login(passport)
  .then((userInfo) => {
    console.log("User Info:", userInfo);
  })
  .catch((error) => {
    console.error("Login failed:", error);
  });
```

---

## 3. `logout` Method

The `logout` method clears the current session, user info, and products, and disconnects from all services.

### Syntax:

```typescript
logout(): void;
```

### Parameters:

- None.

### Return Type:

- No return value.

### Example:

```typescript
assistant.logout();
console.log("Logged out successfully");
```

---

## 4. `start` Method

The `start` method initializes the assistant services, connects to the WebSocket client, and starts the call service.

### Syntax:

```typescript
start(): Promise<void>;
```

### Parameters:

- None.

### Return Type:

- Returns a `Promise` that resolves when the assistant has been successfully started.

### Errors:

- `Error`:
  - If the assistant is not properly initialized (i.e., `passport` or `userInfo` is missing).
  - If no products are found or there’s an error retrieving product information.
  - If the WebSocket connection to the client times out (timeout occurs).
  - If any error occurs while connecting to the client or AI WebSocket.

### Example:

```typescript
assistant
  .start()
  .then(() => {
    console.log("Assistant started");
  })
  .catch((error) => {
    console.error("Start failed:", error);
  });
```

---

## 5. `stop` Method

The `stop` method stops the assistant services, disconnects from WebSocket connections, and stops the call service.

### Syntax:

```typescript
stop(): void;
```

### Parameters:

- None.

### Return Type:

- No return value.

### Example:

```typescript
assistant.stop();
console.log("Assistant stopped");
```

---

## 6. `send` Method

The `send` method is used to send events to the call service. This could include events like `onCall`, `onTalkBegin`, or `onClosed`.

### Syntax:

```typescript
send(event: CallEvent): void;
```

### Parameters:

- `event`: An object that represents a call event. It must have the `type` field, which should be one of the following:

  - `'onCall'`
  - `'onTalkBegin'`
  - `'onClosed'`

### Return Type:

- No return value.

### Errors:

- `Error`:
  - If the event type is invalid (not one of `'onCall'`, `'onTalkBegin'`, or `'onClosed'`).

### Example:

```typescript
const event: CallEvent = {
  type: "onCall",
  customerInfo: { userName: "John Doe", userID: "1234567890" },
};

// const event: CallEvent = {
//   type: 'onTalkBegin',
// }
// const event: CallEvent = {
//   type: 'onClosed',
// }

assistant.send(event);
console.log("Event sent successfully");
```

---

# Additional Information

## Event Emitters

The `Assistant` class uses the `EventEmitter` from the `eventemitter3` library. You can listen to various events such as:

- `callTransition`: Emitted when the call state transitions.
- `aiMessage`: Emitted when a message is received from the AI WebSocket.

### Example:

```typescript
assistant.on("callTransition", (state, event) => {
  console.log("Call state changed:", state, event);
});

assistant.on("aiMessage", (message) => {
  console.log("AI Message received:", message);
});
```

---

## Type Declarations

Below are the type declarations for `AssistantService.UserInfo`, `AssistantService.InitOptions`, and `AssistantService.Passport`, along with the `AssistantService.CallEvent` enum.

### `AssistantService.UserInfo`

This type represents the information about the authenticated user.

```typescript
namespace AssistantService {
  export interface UserInfo {
    userId: string; // The unique identifier of the user
    username: string; // The name of the user
    orgId: string; // The organization ID the user belongs to
    tenantId: number; // The tenant ID associated with the user
  }
}
```

### `AssistantService.InitOptions`

This type is used to configure the `Assistant` instance during initialization.

```typescript
namespace AssistantService {
  export interface InitOptions {
    origin: string; // The base URL (origin) of the assistant service
  }
}
```

### `AssistantService.Passport`

This type represents the passport object used for authentication.

```typescript
namespace AssistantService {
  export interface Passport {
    token: string; // The authentication token
    bizID: string; // The business ID
  }
}
```

### `AssistantService.CallEvent`

This type represents call event after assist started

```typescript
namespace AssistantService {
  export type CallEvent =
    | {
        type: "onCall";
        customerInfo?: Object;
      }
    | {
        type: "onTalkBegin";
      }
    | {
        type: "onClosed";
      };
}
```

---

## Conclusion

The `Assistant` class is designed to manage user authentication, WebSocket connections, and call services. By calling the `login`,`logout`, `start`, `stop`, and `send` methods, you can interact with the assistant's functionalities. Ensure proper error handling when invoking these methods.
