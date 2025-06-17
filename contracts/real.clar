;; Define error codes
(define-constant ERR-INVALID-TOKEN (err u1))
(define-constant ERR-VALIDATION-FAILED (err u2))
(define-constant ERR-UNAUTHORIZED (err u3))
(define-constant ERR-INVALID-PRINCIPAL (err u4))

;; Token validation utility function with explicit response type
(define-private (comprehensive-token-validation (token principal))
    ;; Enhanced validation logic with multiple checks
    (if (and
            ;; Check if token is not null/empty
            (not (is-eq token 'SP000000000000000000002Q6VF78))
            ;; Check if token equals transaction sender
            (is-eq token tx-sender)
            ;; Additional validation: ensure principal is valid format
            (> (len (principal-to-string token)) u0))
        (ok token)
        ERR-INVALID-TOKEN))

;; Helper function to validate principal format
(define-private (is-valid-principal (principal-to-check principal))
    (let ((principal-str (principal-to-string principal-to-check)))
        (and
            (> (len principal-str) u0)
            (not (is-eq principal-to-check 'SP000000000000000000002Q6VF78)))))

;; First approach: Direct validation with match
(define-public (process-new-token (new-token principal))
    (begin
        ;; Pre-validation check
        (asserts! (is-valid-principal new-token) ERR-INVALID-PRINCIPAL)
        (let
            (
                ;; Store the validation result
                (validation-result (comprehensive-token-validation new-token))
            )
            ;; Check the validation result
            (match validation-result
                success (ok u1)
                error ERR-VALIDATION-FAILED)
        )
    )
)

;; Second approach: Alternative validation method
(define-public (process-new-token-alt (new-token principal))
    (begin
        ;; Pre-validation check
        (asserts! (is-valid-principal new-token) ERR-INVALID-PRINCIPAL)
        ;; Validate token with direct matching
        (match (comprehensive-token-validation new-token)
            success (ok u1)
            error ERR-VALIDATION-FAILED)
    )
)

;; Read-only function to check if a principal is valid without state changes
(define-read-only (validate-principal (principal-to-check principal))
    (is-valid-principal principal-to-check))

;; Read-only function to get validation status
(define-read-only (get-validation-status (token principal))
    (match (comprehensive-token-validation token)
        success (ok true)
        error (ok false)))