

export const globalActions = {
  setWallet: (state, action) => {
    state.wallet = action.payload;
  },
  setCreateModal: (state, action) => {
    state.createModal = action.payload;
  },
  setUpdateModal: (state, action) => {
    state.updateModal = action.payload;
  },
  setDeleteModal: (state, action) => {
    state.deleteModal = action.payload;
  },
  setContestModal: (state, action) => {
    state.contestModal = action.payload;
  },
  setChatModal: (state, action) => {
    state.chatModal = action.payload;
  },
  setPolls: (state, action) => {
    state.polls = action.payload;
  },
  setPoll: (state, action) => {
    state.poll = action.payload;
  },
  setGroup: (state, action) => {
    state.group = action.payload;
  },
  setContestants: (state, action) => {
    state.contestants = action.payload;
  },
  setCurrentUser: (state, action) => {
    state.currentUser = action.payload;
  },
  setProvider: (state, action) => {
    state.provider = action.payload;
  },
};
