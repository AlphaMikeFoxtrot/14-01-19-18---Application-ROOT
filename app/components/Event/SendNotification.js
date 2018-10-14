sendNotification = async () => {
    this.setState({
        isLoading: true,
    })
    try {
        console.log(`sendNotification()----> getting data from AsyncStorage...`)
        
        let data = await AsyncStorage.getItem(CONSTANTS.ASYNC_STORAGE.USER)
        data = JSON.parse(data)

        try {

            console.log(`sendNotification()----> getting user data from API....`)

            const options = {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${data.authToken}`
                }
            }
            let response = await fetch(CONSTANTS.API.USER, options)
            let responseJson = await response.json()

            console.log(`data received from API: ${JSON.stringify(responseJson)}`)

            responseJson = responseJson.users

            var messages = []
            
            responseJson.forEach(user => {
                messages.push({
                    "to": user.notificationToken,
                    "sound": "default",
                    "title": this.state.title,
                    "body": this.state.description,
                    priority: "high", 
                    data: {
                        eventId: this.state.event,
                        branchId: data.branchId
                    }
                });
            });

            const expoOptions = {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(messages)
            }
            try {
                
                console.log(`sendNotfication()----> sending notification to devices.....`)

                let notificationResponse = await fetch("https://exp.host/--/api/v2/push/send", options)
                let notificationResponseJson = await notificationResponse.json()

                console.log(`sendNotification()----> notification sent with response: ${JSON.stringify(notificationResponseJson)}`)

                this.setState({
                    isLoading: false,
                })

                this.getEvents()

                return;

            } catch (error) {
                
                console.log(`sendNotification()----> error occured when sending notifications to devices: ${error}`)

                this.setState({
                    isLoading: false,
                    error: true,
                    errorMessage: error
                })

                return;
            }

        } catch (error) {

            conosole.length(`sendNotification()----> error occured when getting users from API: ${error}`)

            this.setState({
                isLoading: false,
                error: true,
                errorMessage: error.toString()
            })

            return;
        }
    } catch (error) {

        console.log(`sendNotification()----> error occured when getting data from AsyncStorage: ${error}`)

        this.setState({
            isLoading: false, 
            error: true, 
            errorMessage: error
        })
        
        return;
    }
}