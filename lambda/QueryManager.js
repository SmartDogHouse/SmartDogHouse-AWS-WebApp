class QueryManager {
  constructor() {}

  query1() {
    return {
        "Statement" : 
        "SELECT daily_water_upper_bound, daily_water_lower_bound FROM dogs_logs WHERE contains(PK, 'DOG#c01')AND contains(SK, '#PROFILE#')"
      } 
  }

  query2(daily_water_lower_bound,daily_water_upper_bound) {
    return {
        "Statement" :
        "SELECT * FROM dogs_logs WHERE contains(PK, 'LOG#wcons') AND contains(SK, 'DOG#c02') AND (time_stamp BETWEEN '22135489941' AND '22135489943') AND val BETWEEN "+ daily_water_lower_bound +" AND "+ daily_water_upper_bound
      } 
  }


  getWaterConsumptionByDog(dog,lowerTimeS,upperTimeS) {
    return this.getConsumptionByDog("LOG#wcons",dog,lowerTimeS,upperTimeS)
  }

  getConsumptionByDog(type,dog,lowerTimeS,upperTimeS) {
    return {
        "Statement" : 
        "SELECT val FROM dogs_logs WHERE contains(PK, '"+type+"')AND contains(SK, '"+dog+"') AND (time_stamp BETWEEN '"+lowerTimeS+"' AND '"+upperTimeS+"')"
      } 
  }

  getFoodConsumptionByDog(dog,lowerTimeS,upperTimeS) {
    return this.getConsumptionByDog("LOG#fcons",dog,lowerTimeS,upperTimeS)
  }
}
  

export default QueryManager;