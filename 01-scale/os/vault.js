// The vault: sealed at build time with AES-256-GCM (key from the PIN via PBKDF2, 120k rounds). Only ciphertext lives here.
export const VAULT = {
 "pinHash": "e8be8572ee8c2dbfb2ce9bc7ee12313fdb55eb2710209a0d3f715f981b3291b0",
 "salt": "mf7LKPcxWKBu6D+//m4z2A==",
 "iv": "Hh6Em0KgZxnxgEUK",
 "ct": "w3Ew2unoyUOUH+6FTE4ZGYEU/JsiqLh4T0KGJWEGuXsHcDvIPJcxWJHew83Cn8qOJ/Bkd+1sNXQxmC55hxNQD2kxyYCVqEofzMrtV/dJKViRpSu5OIitFF0A//9YenxmvSvU0mSBeHMy5NtWT6pA1ZZw0mvnp/5lgfl3sonvAapCo7Aq7LB7KfvzKGngquZMVAs0xa85qxNNTzXIL8EKs5qk/wrnJQbFdimHtWoxsuNn7Dqv0K4Erv1y+GRTMJDgixtPupvpAQS1TAPN3SfLI/7jaX/7XPGox9iyQTapZgTrphIJNHX6aZZNOdOa0afSvAOU//yRN4hmrAoplk04wB3eE5vuAaNEmHznb1te/XwuGewgQv3CJOBoYNngn592gHQuuVbqeIJNV2EqpPGv7YbWsAWWq+cPEk1EBT0IHvly5lBnzg4rEXQkWpUeVbN9biGjhazSKivlcXB4YzYWFHA9GQ8YGsDihbByIdSAI58I9/HciR+TcINGq9kFpj2XJgvpKweokiXxYjNiJo/KXHJJHlJNIOfr+9Ld2v7zxHGplj/ivIjNqS3ft15P1RtFPjTE3udIfNBDic9JyOAU+SIFjHALchOTwa56uM7F8bSz8ndfrUS/eBzlJXdoj77R+JQ=",
 "iterations": 120000
};
