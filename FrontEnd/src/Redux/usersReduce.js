import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import Configuration from "../configuration";
var token = localStorage.getItem("x-access-token");

export const loginFetch = createAsyncThunk("user/login", async (payload) => {
  const response = await fetch(Configuration.BACK_BASEURL + "user/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const users = await response.json();
  return users;
});

export const userAdded = createAsyncThunk("user/addUser", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "user/addUser", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify(action),
  });
  const user = await response.json();
  return user;
});
export const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "user/allUser", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    /* body: JSON.stringify({a: 1, b: 'Textual content'}) */
  });
  const users = await response.json();
  return users;
});

export const exportExcel = createAsyncThunk(
  "planning/exportExcelTerritory",
  async (action) => {
    var annee = action.annee;
    const response = await fetch(
      Configuration.BACK_BASEURL + `user/exportExcelTerritory/${annee}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }
    );
    const users = await response.json();
    return users;
  }
);
export const getTypeUser = createAsyncThunk("user/getTypeUser", async (id) => {
  const response = await fetch(
    Configuration.BACK_BASEURL + "user/getTypeUser/" + id,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    }
  );
  const users = await response.json();
  return users;
});
export const getActivePere = createAsyncThunk(
  "user/getActivePere",
  async () => {
    const response = await fetch(
      Configuration.BACK_BASEURL + "user/getActivePere",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }
    );
    const users = await response.json();
    return users;
  }
);

export const userGetById = createAsyncThunk("user/userGetById", async (id1) => {
  const id = id1;
  const response = await fetch(Configuration.BACK_BASEURL + "user/getUser", {
    method: "POST",
    headers: {
      id: id,
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  });
  const userBase = await response.json();
  return userBase;
});

export const getUserPM = createAsyncThunk("user/getUserPM", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "user/getUserPM", {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  });
  const user = await response.json();
  return user;
});
export const getResponsable = createAsyncThunk(
  "user/getResponsable",
  async (role) => {
    const response = await fetch(
      Configuration.BACK_BASEURL + "user/getResponsable/" + role,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }
    );
    const user = await response.json();
    return user;
  }
);
export const getActiveUser = createAsyncThunk("user/getActive", async () => {
  const response = await fetch(Configuration.BACK_BASEURL + "user/getActive", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
  });
  const user = await response.json();
  return user;
});
export const cheeck = createAsyncThunk("user/cheeck", async (action) => {
  const response = await fetch(Configuration.BACK_BASEURL + "user/cheeck", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-access-token": token,
    },
    body: JSON.stringify(action),
  });
  const user = await response.json();
  return user;
});
export const getFile = createAsyncThunk("user/getFile", async (file) => {
  const response = await fetch(
    Configuration.BACK_BASEURL + "user/getFile/" + file,
    {
      method: "GET",
      responseType: "blob",
      //Force to receive data in a Blob Format
    }
  )
    .then((response) => {
      return response.url;
    })
    .catch((error) => {
      console.log(error);
    });
  const files = await response;
  return files;
});
export const userSignature = createAsyncThunk(
  "user/userSignature",
  async (action) => {
    const response = await fetch(
      Configuration.BACK_BASEURL + "user/saveSignature",
      {
        method: "POST",
        headers: {
          Accept: "application/*",
          "x-access-token": token,
        },
        body: action.signatureArray,
      }
    );
    const files = await response.json();
    return files;
  }
);
export const getDetailUser = createAsyncThunk(
  "user/getDetailUser",
  async (id) => {
    const response = await fetch(
      Configuration.BACK_BASEURL + "user/getDetailUser/" + id,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }
    );
    const user = await response.json();
    return user;
  }
);

export const verification = createAsyncThunk("user/verification", async () => {
  const response = await fetch(
    Configuration.BACK_BASEURL + "user/verification",
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-access-token": token,
      },
    }
  );
  const userBase = await response.json();
  return userBase;
});

export const userDeleted = createAsyncThunk(
  "user/deleteUser",
  async (action) => {
    const response = await fetch(
      Configuration.BACK_BASEURL + "user/deleteUser/" + action.id,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }
    );
    const rootBase = await response.json();
    return rootBase;
  }
);
const usersReduce = createSlice({
  name: "users",
  initialState: {
    entities: [],
    loading: false,
  },
  reducers: {
    profilUpdated(state, action) {
      fetch(Configuration.BACK_BASEURL + "user/updateProfile", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(action.payload),
      });
    },
    /* userChangeEtat(state, action) {
      const { id } = action.payload;
      fetch(Configuration.BACK_BASEURL + "user/changeEtat/"+id, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-access-token':token
        },
        body: JSON.stringify(action.payload)
      });
    }, */
  },
  extraReducers: {
    [getDetailUser.pending]: (state, action) => {
      state.loading = true;
    },
    [getDetailUser.fulfilled]: (state, action) => {
      state.loading = false;
      state.users = [...state.entities, action.payload];
    },
    [getDetailUser.rejected]: (state, action) => {
      state.loading = false;
    },
  },
});

export const { profilUpdated } = usersReduce.actions;

export default usersReduce.reducer;
