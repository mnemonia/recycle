import {Component, OnInit} from '@angular/core';
import {SubscriptionService} from '../services/subscribe/subscription.service';
import {Location, MaterialId, Price, Subscription} from '../model/Subscription';
import {PaymentService} from '../services/payment/payment.service';
import {GeoService} from '../services/geo/geo.service';
import {RecyclingMapService} from '../services/recycling-map/recycling-map.service';
import {MathService} from '../services/math/math.service';

@Component({
    selector: 'app-subscribe',
    templateUrl: './subscribe.page.html',
    styleUrls: ['./subscribe.page.scss'],
})
export class SubscribePage implements OnInit {
    subscription: Subscription;
    price: Price;
    locations: Location[] = [];
    places: any[];
    is_in_search_edit_mode = false;

    constructor(private subscriptionService: SubscriptionService,
                private paymentService: PaymentService,
                private geoApi: GeoService,
                private recyclingMapService: RecyclingMapService,
                private mathService: MathService) {
    }

    ngOnInit() {
        this.places = [];
        this.subscription = this.subscriptionService.create();
        this.recalc();
    }

    public recalc() {
        this.findSammelstellen();
        this.paymentService.calculatePrice(this.subscription);
    }


    public findLocation($event) {
        if (!this.is_in_search_edit_mode) {
            return;
        }
        this.locations = [];
        if ($event.detail.value.trim() === '') {
            return;
        }
        this.geoApi.findLocation($event.detail.value.trim()).subscribe(
            (res) => {
                this.locations = res;
            },
            (err) => {
                console.error(err);
            }
        );
    }

    public removeLocations($event) {
        this.locations = [];
        this.places = [];
    }

    public setIs_in_search_edit_mode(value: boolean) {
        this.is_in_search_edit_mode = value;
    }

    public jumpToLocation(location: Location) {
        // console.log('location', location);
        this.setIs_in_search_edit_mode(false);
        this.locations = [];
        this.subscription.address_canonical = location.address_canonical;
        this.geoApi.identify(location).subscribe((res) => {
                res.filter(r => r.layerBodId === 'ch.swisstopo.swissboundaries3d-gemeinde-flaeche.fill')
                    .forEach(r => {
                        this.subscription.gdekt = r.properties.kanton;
                        this.subscription.gdname = r.properties.gemname;
                        this.subscription.gdid = r.id;
                    });
                res.filter(r => r.layerBodId === 'ch.swisstopo-vd.ortschaftenverzeichnis_plz')
                    .forEach(r => {
                        this.subscription.plz4 = '' + r.properties.plz;
                        this.subscription.plzname = r.properties.langtext;
                        //console.log('plzname', this.subscription.plzname);
                        this.subscription.is_address_identified = true;
                    });
            },
            (err) => {
                this.subscription.is_address_identified = false;
            },
            () => {
                this.findSammelstellen();
            }
        );
    }

    private findSammelstellen() {
        const selectedJobs = this.subscription.jobs.filter(j => j.is_selected);
        const sammelstellenStats = [];
        this.places = [];
        this.subscription.total_saved_km_per_year = 0;
        this.subscription.total_saved_co2_per_year = 0;
        this.subscription.total_saved_fuel_per_year_in_liter = 0;
        this.subscription.total_saved_fuel_per_year_in_fr = 0;
        this.recyclingMapService.findSammelstellen(this.subscription.plz4).subscribe(
            (sammelstellen) => {
                selectedJobs.forEach(j => {
                    let sammelstelleWithMaterialMatch = [];
                    if (j.material_id === MaterialId.MIGROS_GENERATION_M) {
                        sammelstelleWithMaterialMatch =
                            sammelstellen.filter(s => s.full_name.indexOf('Migros') >= 0);
                    } else if (j.material_id === MaterialId.SAMMELSACK_CH) {
                        sammelstelleWithMaterialMatch =
                            sammelstellen.filter(s => s.full_name.indexOf('Bowald') >= 0);
                    } else {
                        sammelstelleWithMaterialMatch =
                            sammelstellen.filter(s => s.materials.filter(m => m.id === j.material_id.valueOf()).length > 0);
                    }
                    j.sammelstellen = sammelstelleWithMaterialMatch;
                    j.sammelstellen.forEach(s => {
                        const stats = sammelstellenStats.filter(sm => sm.id === s.id);
                        if (stats.length === 0) {
                            const sts = {
                                id: s.id,
                                sammelstelle: s,
                                total_count: 1,
                                material: {},
                                materials: []};
                            sts.material[j.material_id] = 1;
                            sts.materials.push(j.material_id);
                            sammelstellenStats.push(sts);
                        } else {
                            stats.forEach(sts => {
                                sts.total_count += 1;
                                if (!(j.material_id in sts.material)) {
                                    sts.material[j.material_id] = 1;
                                    sts.materials.push(j.material_id);
                                } else {
                                    sts.material[j.material_id] += 1;
                                }
                            });
                        }
                    });
                });
            },
            (err) => console.error(err),
            () => {
                // case one is found for all materials:
                const size = selectedJobs.length;
                let allMatchingSammelstellen = sammelstellenStats.filter(s => s.total_count === size);
                allMatchingSammelstellen.forEach(s => this.places.push(s));
                allMatchingSammelstellen.forEach(sts => {
                    const to_address = sts.sammelstelle.full_name + ', '
                        + sts.sammelstelle.city.zip + ' ' + sts.sammelstelle.city.name;
                    this.recyclingMapService.calculateRoutes(to_address,
                        this.subscription.address_canonical).subscribe(
                                            (route: any) => {
                                                sts.sammelstelle.distance_in_km = route.route.rawdistance / 1000;
                                                sts.sammelstelle.co2_exhaust_in_kg = sts.sammelstelle.distance_in_km * 0.185;
                                                sts.sammelstelle.match_count = 0;
                                            },
                        (err) => {},
                        () => {
                            this.places = this.places.sort((a, b) => {
                                                                if (a.sammelstelle.distance_in_km > b.sammelstelle.distance_in_km) {
                                                                    return 1;
                                                                }
                                                                if (a.sammelstelle.distance_in_km < b.sammelstelle.distance_in_km) {
                                                                    return -1;
                                                                }
                                                                return 0;
                                                            });
                            if (this.places.length > 0) {
                                this.subscription.total_saved_km_per_year = (52 / this.subscription.interval.repeat_weeks) * 2 * this.places[0].sammelstelle.distance_in_km;
                                this.subscription.total_saved_co2_per_year = (52 / this.subscription.interval.repeat_weeks) * 2 * this.places[0].sammelstelle.co2_exhaust_in_kg;
                                this.subscription.total_saved_fuel_per_year_in_liter = this.subscription.total_saved_km_per_year * (8 / 100);
                                this.subscription.total_saved_fuel_per_year_in_fr = this.subscription.total_saved_fuel_per_year_in_liter * 1.38;
                            }

                        });
                });
            }
        );
    }

    setWeight(weight) {
        setTimeout(() => {
            this.subscription.estimated_weight_in_kg = weight;
            this.recalc();
        }, 450);
    }

    setWeekday(weekday) {
        setTimeout(() => {
            this.subscription.interval.repeat_weekday_number = weekday;
            //this.recalc();
        }, 450);
    }

    setDayHour(hr) {
        setTimeout(() => {
            this.subscription.interval.repeat_dayhour_number = hr;
            // this.recalc();
        }, 450);
    }

    setRepeatWeeks(w) {
        setTimeout(() => {
            this.subscription.interval.repeat_weeks = w;
            this.recalc();
        }, 450);
    }

}
