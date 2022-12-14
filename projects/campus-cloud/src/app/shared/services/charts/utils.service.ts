import { Injectable } from '@angular/core';
import * as moment from 'moment';

import { CPI18nService } from '../i18n.service';
import { CPSession } from '@campus-cloud/session';
import { CPDate } from '@campus-cloud/shared/utils';

export enum DivideBy {
  'daily' = 0,
  'weekly' = 1,
  'monthly' = 2,
  'quarter' = 3,
  'yearly' = 4
}

export const addGroup = (data) => {
  return data.map((group: Number[]) => {
    return group.reduce((prev: number, next: number) => prev + next);
  });
};

export const aggregate = (data: Number[], serie: Number[]): Promise<Number[]> => {
  const arr = [];

  data.reduce(
    (prev, current, index) => {
      if (prev === current) {
        arr[arr.length - 1] += serie[index];

        return current;
      }

      arr.push(serie[index]);

      return current;
    },

    0
  );

  return new Promise((resolve) => {
    resolve(arr);
  });
};

export const groupByWeek = (dates: any[], series: Number[]) => {
  const datesByWeek = dates.map((d) => moment(d).week());

  return aggregate(datesByWeek, series);
};

export const groupByMonth = (dates: any[], series: Number[]) => {
  const datesByMonth = dates.map((d) => moment(d).month());

  return aggregate(datesByMonth, series);
};

export const groupByQuarter = (dates: any[], series: Number[]) => {
  const datesByQuarter = dates.map((d) => moment(d).quarter());

  return aggregate(datesByQuarter, series);
};

export const groupByYear = (dates: any[], series: Number[]) => {
  const datesByYear = dates.map((d) => moment(d).year());

  return aggregate(datesByYear, series);
};

@Injectable()
export class ChartsUtilsService {
  constructor(public session: CPSession) {}

  dailyLabel(range, index) {
    const date = CPDate.toEpoch(moment(range).add(index, 'days'), this.session.tz);

    return moment
      .unix(date)
      .locale(CPI18nService.getLocale())
      .format('MMM D');
  }

  weeklyLabel(range, index) {
    const weekOne = moment(range).add(index, 'weeks');

    const weekStart = CPDate.toEpoch(weekOne, this.session.tz);

    const weekEnd = CPDate.toEpoch(weekOne.add(1, 'weeks'), this.session.tz);

    return `${moment
      .unix(weekStart)
      .locale(CPI18nService.getLocale())
      .format('MMM D')} - ${moment
      .unix(weekEnd)
      .locale(CPI18nService.getLocale())
      .format('MMM D')}`;
  }

  monthlyLabel(range, index) {
    const date = CPDate.toEpoch(moment(range).add(index, 'months'), this.session.tz);

    return moment
      .unix(date)
      .locale(CPI18nService.getLocale())
      .format('MMM YY');
  }

  quarterLabel(range, index) {
    const date = CPDate.toEpoch(
      moment(range)
        .locale(CPI18nService.getLocale())
        .add(index, 'quarters'),
      this.session.tz
    );

    return moment
      .unix(date)
      .locale(CPI18nService.getLocale())
      .format('MMM YY');
  }

  yearLabel(range, index) {
    const date = CPDate.toEpoch(moment(range).add(index, 'years'), this.session.tz);

    return moment
      .unix(date)
      .locale(CPI18nService.getLocale())
      .format('YYYY');
  }

  chartOptions(divider, series) {
    return {
      high: this.highestNoInArray(series),

      axisX: {
        labelInterpolationFnc: function skipLabels(value, index) {
          if (index + 1 === series[0].length) {
            return null;
          }

          if (divider === DivideBy.daily) {
            if (series[0].length > 15) {
              return index % 8 === 0 ? value : null;
            }

            return index % 3 === 0 ? value : null;
          }

          if (divider === DivideBy.weekly) {
            if (series[0].length > 15) {
              return index % 8 === 0 ? value : null;
            }

            return index % 4 === 0 ? value : null;
          }

          return value;
        }.bind(this)
      }
    };
  }

  labelByDivider(divider, range, index) {
    let label;
    switch (divider) {
      case DivideBy.daily:
        label = this.dailyLabel(range.start, index);
        break;

      case DivideBy.weekly:
        label = this.weeklyLabel(range.start, index);
        break;

      case DivideBy.monthly:
        label = this.monthlyLabel(range.start, index);
        break;

      case DivideBy.quarter:
        label = this.quarterLabel(range.start, index);
        break;

      case DivideBy.yearly:
        label = this.yearLabel(range.start, index);
        break;
    }

    return label;
  }

  buildLabels(divider, range, series) {
    return series[0].map((_, index) => {
      return this.labelByDivider(divider, range, index);
    });
  }

  buildSeries(divider, range, tooltip, series) {
    return series.map((serie) => {
      return serie.map((item) => {
        return item;
      });
    });
  }

  highestNoInArray(series) {
    let highestNoInArray = 0;

    series.map((serie) => {
      serie.map((item) => {
        if (highestNoInArray < item) {
          highestNoInArray = item;
        }
      });
    });

    return highestNoInArray + 5 - ((highestNoInArray + 5) % 5);
  }
}
