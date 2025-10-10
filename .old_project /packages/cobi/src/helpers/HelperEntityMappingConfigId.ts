let uid = 1;

export function getUid() {
  return ++uid;
}

export function setUid(id) {
  uid = id;
}
