'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context;

describe('Tests get dogs', function () {
    it('verifies successful response', async () => {
        const result = await app.getDogs(event, context)
        expect(result).to.be.an('object');
        expect(result.body).to.be.an('string');
        expect(result.statusCode).to.equal(200);
        let response = JSON.parse(result.body);
        expect(response).to.be.an('array');
        console.log(response)

    });
});


describe('Tests insert dog', function () {
    it('verifies successful response and check insertion', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            'chip_id': 'c10',
            'name': 'Snowball',
            'size': 4,
            'status': 'curing',
            'cage': 35
        })
        ev.body = params

        const result = await app.insertNewDog(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);  
    });
});



describe('Tests get total consumption', function () {
    it('verifies successful response and response semantics', async () => {
        
        var ev = require('../../../events/Templates/fullTemplateRequest.json'); 
        const params = {
            'lowerT': '2021-08-09T11:15:36',
            'upperT': '2021-09-08T16:16:08',
            'dog': 'c02'
        }
        ev.queryStringParameters = params

        const result = await app.getTotalCosumption(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);  
        let response = JSON.parse(result.body);
        expect(response).to.be.an('object');
        expect(response).to.have.property('waterTotal');
        expect(response).to.have.property('foodTotal');
        expect(response.waterTotal).to.be.a('number');
        expect(response.foodTotal).to.be.a('number');
    });
});

describe('Tests get environment logs', function () {
    it('verifies successful response', async () => {
        
        var ev = require('../../../events/Templates/fullTemplateRequest.json'); 
        const params = {
            'lowerT': '2021-08-09T11:15:36',
            'upperT': '2021-09-08T16:16:08',
            'type': 'hum'
        }
        ev.queryStringParameters = params

        const result = await app.getEnvironmentLogs(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);  
        let response = JSON.parse(result.body);
        expect(response).to.be.an('array');
    });
});


describe('Tests get logs by dog', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/fullTemplateRequest.json'); 
        const params = {
            'lowerT': '2021-08-09T11:15:36',
            'upperT': '2021-09-08T16:16:08',
            'type': 'hb',
            'dog': 'c02'
        }
        ev.queryStringParameters = params

        const result = await app.getEnvironmentLogs(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);  
        let response = JSON.parse(result.body);
        expect(response).to.be.an('array');
    });
});


describe('Tests update dog status', function () {
    it('verifies successful response and checks insertion', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            'chip_id': 'c10',
            'status': 'healthy',
        })
        ev.body = params

        const result = await app.updateDogStatus(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);   
        
    });
});

describe('Tests transfer dog in another cage', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            'chip_id': 'c10',
            'new_cage': 99,
        })
        ev.body = params

        const result = await app.updateDogStatus(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);      
    });
});

describe('Tests set food schedule by dog', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            "chip_id": 'c03',
            "time": '11:45',
            "grams": 250
        })
        ev.body = params

        const result = await app.setFoodScheduleByDog(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);          
    });
});

describe('Tests set food schedule by dog', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            "size": '3',
            "time": '11:45',
            "grams": 120
        })
        ev.body = params

        const result = await app.setFoodScheduleBySize(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);          
    });
});

describe('Tests set normal consumption ranges by dog', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            "chip_id": 'c02',
            "lower_bound": 36,
            "upper_bound": 40,
            "type": 'water'
        })
        ev.body = params

        const result = await app.setConsRangesByDog(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);          
    });
});

describe('Tests set normal consumption ranges by size', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            "size": '4',
            "lower_bound": 36,
            "upper_bound": 40,
            "type": 'water'
        })
        ev.body = params

        const result = await app.setConsRangesBySize(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);          
    });
});


describe('Tests set normal vital param ranges by size', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            "lower_bound": 36,
            "upper_bound": 41,
            "dog_size": 4,
            "type": 'heartbeat'
        })
        ev.body = params

        const result = await app.setVitalParamRangesBySize(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);          
    });
});

describe('Tests set normal vital param ranges by dog', function () {
    it('verifies successful response and semantics', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            "lower_bound": 36,
            "upper_bound": 41,
            "chip_id": 'c10',
            "type": 'heartbeat'
        })
        ev.body = params

        const result = await app.setVitalParamRangesByDog(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);          
    });
});


describe('Tests remove dog', function () {
    it('verifies successful response and check deletion', async () => {
        
        var ev = require('../../../events/Templates/partialTemplateRequest.json'); 
        const params = JSON.stringify({
            'chip_id': 'c10',
        })
        ev.body = params

        const result = await app.removeDog(ev, context)
        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);  
    });
});