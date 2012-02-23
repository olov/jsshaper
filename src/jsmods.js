// module keyword is removed so that it parses like any identifier
delete Narcissus.definitions.tokens.module;
delete Narcissus.definitions.keywords.module;
delete Narcissus.definitions.tokenIds.module;
/* global */ tkn = Narcissus.definitions.tokenIds;

// don't use const; it doesn't work in strict mode
Narcissus.hostSupportsEvalConst = false;
