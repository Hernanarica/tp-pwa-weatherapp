const storage = {
	save: (key, value) => {
		localStorage.setItem(key, value);
	},
	delete: (key) => {
		localStorage.removeItem(key);
	},
	get: (key) => {
		return localStorage.getItem(key);
	},
	clear: () => {
		localStorage.clear();
	}
};

export default storage;