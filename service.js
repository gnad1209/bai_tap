export function apiRequest(url, options) {
    return new Promise((resolve, reject) => {
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => reject(err));
                }
                return response.json().then(data => resolve(data));
            })
            .catch(error => reject(error));
    });
}
