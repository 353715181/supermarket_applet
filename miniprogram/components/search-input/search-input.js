Component({
    data: {},
    properties: {},
    methods: {
        onClick(e) {
            console.log(e);
            wx.navigateTo({
                url: '../../pages/searchInput/search-input'
            });
        }
    }


})