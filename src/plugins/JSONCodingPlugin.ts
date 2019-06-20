/**
  * JSONCoding plugin for remodel.
  * It generates two additional methods, which convert the object to/from a JSON dictionary:
  * - initWithJSONDictionary initializer
  * - toJSONDictionary instance method
  *
  * Add includes<JSONCoding> to your .value file to use.
  *
  */

import AlgebraicType = require('../algebraic-type');
import Code = require('../code');
import Error = require('../error');
import FileWriter = require('../file-writer');
import Maybe = require('../maybe');
import ObjC = require('../objc');
import ObjectSpec = require('../object-spec');
import StringUtils = require('../string-utils');
import FunctionUtils = require('../function-utils');
import ObjectSpecCodeUtils = require('../object-spec-code-utils');
import ObjectSpecUtils = require('../object-spec-utils')
import CodingUtils = require('./coding-utils');
import Coding = require('./coding');
import ObjCTypeUtils = require('../objc-type-utils');

function dictionaryWrappingDirectly(attributeName: string):string {
  return attributeName;
}

function dictionaryWrappingAmpersand(attributeName: string):string {
  return "@(" + attributeName + ")";
}

function dictionaryUnwrappingDirectly(attributeName: string):string {
  return attributeName;
}

function dictionaryUnwrappingByKeyword(unwrappingKeyword: string): (attributeName: string) => string {
  return function(attributeName: string): string {
    return "[" + attributeName + " " + unwrappingKeyword + "]"
  };
}

function nonnullValueGeneratorWithDefaultValue(defaultValue: string): (attributeName: string) => string {
  return function(attributeName: string): string {
    return attributeName + ' ?: ' + defaultValue;
  }
}

function originalValueGenerator(attributeName: string): string {
  return attributeName;
}

function dictionaryParsingFunction(attribute:ObjectSpec.Attribute) {
  const iVarString:string = ObjectSpecCodeUtils.ivarForAttribute(attribute);
  const type:ObjC.Type = ObjectSpecCodeUtils.computeTypeOfAttribute(attribute);
  const defaultParsingFunction =  {
    keyWrappingGenerator: dictionaryWrappingDirectly,
    keyUnwrappingGenerator: dictionaryUnwrappingDirectly,
    nonnullValueGenerator: originalValueGenerator,
  };

  return ObjCTypeUtils.matchType({
    id: function() {
      return defaultParsingFunction;
    },
    NSObject: function() {
      const typeName = attribute.type.name;
      if (typeName === 'NSString') {
        return {
          keyWrappingGenerator: dictionaryWrappingDirectly,
          keyUnwrappingGenerator: dictionaryUnwrappingDirectly,
          nonnullValueGenerator: nonnullValueGeneratorWithDefaultValue('@""'),
        };
      } else if (typeName === 'NSArray') {
        return {
          keyWrappingGenerator: dictionaryWrappingDirectly,
          keyUnwrappingGenerator: dictionaryUnwrappingDirectly,
          nonnullValueGenerator: nonnullValueGeneratorWithDefaultValue('@[]'),
        };
      } else if (typeName === 'NSSet') {
        return {
          keyWrappingGenerator: dictionaryWrappingDirectly,
          keyUnwrappingGenerator: dictionaryUnwrappingDirectly,
          nonnullValueGenerator: nonnullValueGeneratorWithDefaultValue('[NSSet new]'),
        };
      } else if (typeName === 'NSDictionary') {
        return {
          keyWrappingGenerator: dictionaryWrappingDirectly,
          keyUnwrappingGenerator: dictionaryUnwrappingDirectly,
          nonnullValueGenerator: nonnullValueGeneratorWithDefaultValue('@{}'),
        };
      } else {
        return {
          keyWrappingGenerator: dictionaryWrappingDirectly,
          keyUnwrappingGenerator: dictionaryUnwrappingDirectly,
          nonnullValueGenerator: nonnullValueGeneratorWithDefaultValue('[NSNull null]'),
        };
      }
    },
    BOOL: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("boolValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    NSInteger: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("integerValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    NSUInteger: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("unsignedIntegerValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    double: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("doubleValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    float: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("floatValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    CGFloat: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("floatValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    NSTimeInterval: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("doubleValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    uintptr_t: function() {
      return defaultParsingFunction;
    },
    uint32_t: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("unsignedIntValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    uint64_t: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("unsignedLongLongValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    int32_t: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("intValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    int64_t: function() {
      return {
        keyWrappingGenerator: dictionaryWrappingAmpersand,
        keyUnwrappingGenerator: dictionaryUnwrappingByKeyword("longLongValue"),
        nonnullValueGenerator: originalValueGenerator,
      };
    },
    SEL: function() {
      return defaultParsingFunction;
    },
    NSRange: function() {
      return defaultParsingFunction;
    },
    CGRect: function() {
      return defaultParsingFunction;
    },
    CGPoint: function() {
      return defaultParsingFunction;
    },
    CGSize: function() {
      return defaultParsingFunction;
    },
    UIEdgeInsets: function() {
      return defaultParsingFunction;
    },
    Class: function() {
      return defaultParsingFunction;
    },
    dispatch_block_t: function() {
      return defaultParsingFunction;
    },
    unmatchedType: function() {
      return null;
    }
  }, type);
}

function safeWrapEncodingStatement(parsingFunction, encodingStatement): string {
  let wrapped = encodingStatement;
  if (parsingFunction) {
    wrapped = parsingFunction.keyWrappingGenerator(encodingStatement);
    wrapped = parsingFunction.nonnullValueGenerator(wrapped);
  }
  return wrapped;
}

function toIvarKeyValuePair(attribute:ObjectSpec.Attribute):string {
  const codeableAttribute:Coding.CodeableAttribute = Coding.codingAttributeForValueAttribute(attribute);
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(codeableAttribute.type);

  const iVar = '_' + attribute.name;
  const encodingStatement = codingStatements ? codingStatements.encodeValueStatementGenerator(iVar) : iVar;

  const parsingFunction = dictionaryParsingFunction(attribute);
  const wrapped = safeWrapEncodingStatement(parsingFunction, encodingStatement)

  const keyName = attribute.name;
  return 'dict[@"' + keyName + '"] = ' + wrapped + ';' ;
}

function instanceToDictionaryConverter(attributes:ObjectSpec.Attribute[]):string[] {
  const result = [
    'NSMutableDictionary *dict = [[NSMutableDictionary alloc] init];'
  ].concat(attributes.map(toIvarKeyValuePair))
   .concat([
    'return [dict copy];',
  ]);
  return result;
}

function instanceToDictionaryMethod(attributes:ObjectSpec.Attribute[]):ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol:Maybe.Nothing<string>(),
    code: instanceToDictionaryConverter(attributes),
    comments:[],
    compilerAttributes:[],
    keywords: [
      {
        name: 'toJsonDictionary',
        argument: Maybe.Nothing<ObjC.KeywordArgument>()
      }
    ],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'NSDictionary *',
        reference: 'NSDictionary *'
      }),
      modifiers: []
    }
  };
}

function safeUnwrapDecodingStatement(parsingFunction, decodingStatement): string {
  let unwrapped = decodingStatement;
  if (parsingFunction) {
    unwrapped = parsingFunction.keyUnwrappingGenerator(unwrapped);
  }
  return unwrapped;
}

function toIvarAssignment(supportsValueSemantics:boolean, attribute:ObjectSpec.Attribute) {
  const codeableAttribute:Coding.CodeableAttribute = Coding.codingAttributeForValueAttribute(attribute);
  const codingStatements:CodingUtils.CodingStatements = CodingUtils.codingStatementsForType(codeableAttribute.type);

  const keyName = attribute.name;
  const raw = 'dictionary[@"' + keyName + '"]';
  const parsingFunction = dictionaryParsingFunction(attribute);
  const unwrapped = safeUnwrapDecodingStatement(parsingFunction, raw);

  let decoded = codingStatements.decodeValueStatementGenerator(unwrapped);

  const shouldCopy = ObjectSpecCodeUtils.shouldCopyIncomingValueForAttribute(supportsValueSemantics, attribute);
  if (shouldCopy) {
    decoded = '[' + decoded + ' copy]'
  }
  decoded = decoded + ";"
  return '_' + attribute.name + ' = ' + decoded;
}

function dictionaryToInstanceInitializer(supportsValueSemantics:boolean, attributes:ObjectSpec.Attribute[]){
  const result = [
    'if ((self = [super init])) {'
  ].concat(attributes.map(FunctionUtils.pApplyf2(supportsValueSemantics, toIvarAssignment)).map(StringUtils.indent(2)))
   .concat([
    '}',
    'return self;'
  ]);
  return result;
}

function dictionaryToInstanceMethod(supportsValueSemantics:boolean, attributes:ObjectSpec.Attribute[]):ObjC.Method {
  return {
    preprocessors: [],
    belongsToProtocol: Maybe.Just<string>('NSString'),
    code: dictionaryToInstanceInitializer(supportsValueSemantics, attributes),
    comments:[],
    compilerAttributes:[],
    keywords: [
      {
        name: 'initWithJSONDictionary',
        argument: Maybe.Just<ObjC.KeywordArgument>({
          name: 'dictionary',
          modifiers: [],
          type: {
            name: 'NSDictionary *',
            reference: 'NSDictionary *'
          }
        })
      }
    ],
    returnType: {
      type: Maybe.Just<ObjC.Type>({
        name: 'instancetype',
        reference: 'instancetype'
      }),
      modifiers: []
    }
  };
}

function doesValueAttributeContainAnUnsupportedType(attribute:ObjectSpec.Attribute) {
  return dictionaryParsingFunction(attribute) == null;
}

function valueAttributeToUnsupportedTypeError(objectType, attribute) {
  return Maybe.match(function (underlyingType) {
      return Error.Error('The JSONCoding plugin does not know how to decode and encode the backing type "' + underlyingType + '" from ' + objectType.typeName + '.' + attribute.name + '. ' + attribute.type.name + ' is not supported.');
  }, function () {
      return Error.Error('The JSONCoding plugin does not know how to decode and encode the type "' + attribute.type.name + '" from ' + objectType.typeName + '.' + attribute.name + '. ' + attribute.type.name + ' is not supported.');
  }, attribute.type.underlyingType);
}

export function createPlugin():ObjectSpec.Plugin {
  return {
    additionalFiles: function(objectType:ObjectSpec.Type):Code.File[] {
      return [];
    },
    transformBaseFile: function(
      objectType: ObjectSpec.Type,
      baseFile: Code.File,
    ): Code.File {
      return baseFile;
    },
    additionalTypes: function(objectType:ObjectSpec.Type):ObjectSpec.Type[] {
      return [];
    },
    classMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      return [];
    },
    transformFileRequest: function(
      request: FileWriter.Request,
    ): FileWriter.Request {
      return request;
    },
    attributes: function(objectType:ObjectSpec.Type):ObjectSpec.Attribute[] {
      return [];
    },
    fileType: function(objectType:ObjectSpec.Type):Maybe.Maybe<Code.FileType> {
      return Maybe.Nothing<Code.FileType>();
    },
    forwardDeclarations: function(objectType:ObjectSpec.Type):ObjC.ForwardDeclaration[] {
      return [];
    },
    functions: function(objectType:ObjectSpec.Type):ObjC.Function[] {
      return [];
    },
    headerComments: function(objectType:ObjectSpec.Type):ObjC.Comment[] {
      return [];
    },
    implementedProtocols: function(objectType:ObjectSpec.Type):ObjC.Protocol[] {
      return [];
    },
    imports: function(objectType:ObjectSpec.Type):ObjC.Import[] {
      return [];
    },
    instanceMethods: function(objectType:ObjectSpec.Type):ObjC.Method[] {
      const supportsValueSemantics:boolean =
      ObjectSpecUtils.typeSupportsValueObjectSemantics(objectType);
      return [instanceToDictionaryMethod(objectType.attributes),
              dictionaryToInstanceMethod(supportsValueSemantics,
                objectType.attributes)];
    },
    properties: function(objectType:ObjectSpec.Type):ObjC.Property[] {
      return [];
    },
    requiredIncludesToRun:['JSONCoding'],
    staticConstants: function(objectType:ObjectSpec.Type):ObjC.Constant[] {
      return [];
    },
    validationErrors: function(objectType:ObjectSpec.Type):Error.Error[] {
      return objectType.attributes.filter(
        doesValueAttributeContainAnUnsupportedType).map(
          FunctionUtils.pApplyf2(objectType, valueAttributeToUnsupportedTypeError));
    },
    macros: function(valueType: ObjectSpec.Type): ObjC.Macro[] {
      return [];
    },
    nullability: function(objectType:ObjectSpec.Type):Maybe.Maybe<ObjC.ClassNullability> {
      return Maybe.Nothing<ObjC.ClassNullability>();
    },
     subclassingRestricted: function(objectType: ObjectSpec.Type): boolean {
        return false;
      },
  };
}
