class HTTPManager {

  static handleError (error){
    switch (error) {
      case null:
      case "":
        return {statusCode = 500};

    }
  }

}

export default HTTPManager;