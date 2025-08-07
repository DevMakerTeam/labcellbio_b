import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNotEmptyThenString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyThenString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // 1단계: 빈 값 체크
          if (value === undefined || value === null || value === '') {
            return false;
          }
          
          // 2단계: 문자열 타입 체크
          if (typeof value !== 'string') {
            return false;
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;
          
          // 1단계: 빈 값 에러
          if (value === undefined || value === null || value === '') {
            return `${args.property}은(는) 필수입니다.`;
          }
          
          // 2단계: 타입 에러
          if (typeof value !== 'string') {
            return `${args.property}은(는) 문자열이어야 합니다.`;
          }
          
          return `${args.property}이(가) 유효하지 않습니다.`;
        },
      },
    });
  };
}

export function IsNotEmptyThenStringMaxLength(maxLength: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyThenStringMaxLength',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxLength],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // 1단계: 빈 값 체크
          if (value === undefined || value === null || value === '') {
            return false;
          }
          
          // 2단계: 문자열 타입 체크
          if (typeof value !== 'string') {
            return false;
          }
          
          // 3단계: 길이 체크
          if (value.length > maxLength) {
            return false;
          }
          
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const value = args.value;
          const maxLength = args.constraints[0];
          
          // 1단계: 빈 값 에러
          if (value === undefined || value === null || value === '') {
            return `${args.property}은(는) 필수입니다.`;
          }
          
          // 2단계: 타입 에러
          if (typeof value !== 'string') {
            return `${args.property}은(는) 문자열이어야 합니다.`;
          }
          
          // 3단계: 길이 에러
          if (value.length > maxLength) {
            return `${args.property}은(는) ${maxLength}자를 초과할 수 없습니다.`;
          }
          
          return `${args.property}이(가) 유효하지 않습니다.`;
        },
      },
    });
  };
}
