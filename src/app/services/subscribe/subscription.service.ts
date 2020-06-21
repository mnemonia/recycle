import { Injectable } from '@angular/core';
import {Interval, Subscription} from '../../model/Subscription';
import {JobsService} from '../job/jobs.service';
import {PaymentService} from '../payment/payment.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private jobService: JobsService, private paymentService: PaymentService) { }


  public create() {
    const c = new Subscription();
    c.surname = 'Maxi';
    c.lastname = 'Mustermann';
    c.street = '';
    c.number = '';
    c.is_address_identified = false;
    c.plz4 = '';
    c.plzname = '';
    c.gdekt = '';
    c.gdname = '';
    c.interval = new Interval();
    c.interval.repeat_weekday_number = 0;
    c.interval.repeat_dayhour_number = 18;
    c.estimated_weight_in_kg = 3;
    c.interval.repeat_weeks = 2;
    c.interval.is_active = false;
    c.jobs = this.jobService.find() ;
    c.price_per_month = this.paymentService.calculatePrice(c);
    c.total_saved_co2_per_year = 0;
    c.total_saved_km_per_year = 0;
    c.total_saved_fuel_per_year_in_liter = 0;
    c.total_saved_fuel_per_year_in_fr = 0;
    c.address_canonical = c.street + ' ' + c.number + ' ' + c.plz4 + ' ' + c.plzname;
    return c;
  }
}
